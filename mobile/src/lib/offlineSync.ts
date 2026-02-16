/**
 * F8-005: Robust offline mode
 *
 * Caches the latest plan + shopping list in AsyncStorage.
 * Queues mutations when offline and syncs when reconnected.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { WeekMealsMap } from '../data/plan';

// ─── Cache keys ───

const CACHE_PLAN_KEY = 'mealmap/offline-cache-plan';
const CACHE_SHOPPING_KEY = 'mealmap/offline-cache-shopping';
const PENDING_QUEUE_KEY = 'mealmap/offline-pending-queue';

// ─── Types ───

export type CachedPlanData = {
  planId: string;
  weekMeals: WeekMealsMap;
  approvedIds: string[];
  cachedAt: string;
};

export type CachedShoppingData = {
  planId: string;
  items: Array<{
    name: string;
    amount: number;
    unit: string;
    category: string;
    checked: boolean;
  }>;
  cachedAt: string;
};

export type PendingMutation = {
  id: string;
  type: 'approve_meal' | 'replace_meal' | 'toggle_shopping' | 'rate_meal' | 'save_plan';
  payload: Record<string, unknown>;
  createdAt: string;
};

// ─── Cache operations ───

export async function cachePlanData(data: CachedPlanData): Promise<void> {
  await AsyncStorage.setItem(CACHE_PLAN_KEY, JSON.stringify(data));
}

export async function getCachedPlanData(): Promise<CachedPlanData | null> {
  const raw = await AsyncStorage.getItem(CACHE_PLAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedPlanData;
  } catch {
    return null;
  }
}

export async function cacheShoppingData(data: CachedShoppingData): Promise<void> {
  await AsyncStorage.setItem(CACHE_SHOPPING_KEY, JSON.stringify(data));
}

export async function getCachedShoppingData(): Promise<CachedShoppingData | null> {
  const raw = await AsyncStorage.getItem(CACHE_SHOPPING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedShoppingData;
  } catch {
    return null;
  }
}

// ─── Pending mutation queue ───

export async function enqueueMutation(mutation: Omit<PendingMutation, 'id' | 'createdAt'>): Promise<void> {
  const queue = await getPendingQueue();
  queue.push({
    ...mutation,
    id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
}

export async function getPendingQueue(): Promise<PendingMutation[]> {
  const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingMutation[];
  } catch {
    return [];
  }
}

export async function clearPendingQueue(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_QUEUE_KEY);
}

export async function removeMutationFromQueue(id: string): Promise<void> {
  const queue = await getPendingQueue();
  const filtered = queue.filter((m) => m.id !== id);
  await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(filtered));
}

// ─── Network status ───

let _isOnline = true;
const _onlineListeners = new Set<(online: boolean) => void>();

export function isOnline(): boolean {
  return _isOnline;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  _onlineListeners.add(callback);
  return () => { _onlineListeners.delete(callback); };
}

/**
 * Initialize offline sync monitoring.
 * Call once at app startup.
 */
export function initOfflineSync(): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const wasOnline = _isOnline;
    _isOnline = state.isConnected ?? false;

    if (!wasOnline && _isOnline) {
      // Came back online — flush pending mutations
      flushPendingQueue().catch(() => undefined);
    }

    _onlineListeners.forEach((fn) => fn(_isOnline));
  });

  return unsubscribe;
}

// ─── Sync logic ───

type MutationHandler = (mutation: PendingMutation) => Promise<boolean>;
let _mutationHandler: MutationHandler | null = null;

/**
 * Register a handler that processes queued mutations when connectivity returns.
 */
export function registerMutationHandler(handler: MutationHandler): void {
  _mutationHandler = handler;
}

async function flushPendingQueue(): Promise<void> {
  if (!_mutationHandler) return;

  const queue = await getPendingQueue();
  if (queue.length === 0) return;

  for (const mutation of queue) {
    try {
      const success = await _mutationHandler(mutation);
      if (success) {
        await removeMutationFromQueue(mutation.id);
      }
    } catch {
      // Stop processing on first failure — will retry on next reconnect
      break;
    }
  }
}

/**
 * Manually trigger sync (e.g. on pull-to-refresh).
 */
export async function syncNow(): Promise<{ synced: number; remaining: number }> {
  if (!_isOnline) return { synced: 0, remaining: (await getPendingQueue()).length };

  const before = await getPendingQueue();
  await flushPendingQueue();
  const after = await getPendingQueue();

  return { synced: before.length - after.length, remaining: after.length };
}

/**
 * F8-010: Performance profiling + optimization utilities
 *
 * Provides React hooks and utilities for eliminating re-renders,
 * lazy loading, and memoization of heavy components.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

// ─── Re-render tracker (dev only) ───

/**
 * Hook that logs when a component re-renders and why.
 * Only active in __DEV__ mode.
 */
export function useRenderTracker(componentName: string, props: Record<string, unknown>): void {
  const prevProps = useRef<Record<string, unknown>>({});
  const renderCount = useRef(0);

  useEffect(() => {
    if (!__DEV__) return;

    renderCount.current += 1;
    const changed: string[] = [];

    for (const key of Object.keys(props)) {
      if (prevProps.current[key] !== props[key]) {
        changed.push(key);
      }
    }

    if (renderCount.current > 1 && changed.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`[perf] ${componentName} re-render #${renderCount.current}, changed: ${changed.join(', ')}`);
    }

    prevProps.current = { ...props };
  });
}

// ─── Deferred rendering ───

/**
 * Hook that defers non-critical rendering until after interactions complete.
 * Useful for heavy components below the fold.
 */
export function useDeferredRender(delayMs = 0): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (delayMs > 0) {
        setTimeout(() => setReady(true), delayMs);
      } else {
        setReady(true);
      }
    });
    return () => task.cancel();
  }, [delayMs]);

  return ready;
}

// ─── Debounced value ───

/**
 * Returns a debounced version of a value. Useful for search inputs
 * to avoid re-filtering on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// ─── Stable callback ───

/**
 * Returns a stable callback reference that always calls the latest function.
 * Prevents unnecessary child re-renders from changing callback references.
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const ref = useRef(callback);
  ref.current = callback;

  return useCallback((...args: any[]) => ref.current(...args), []) as T;
}

// ─── Lazy initialization ───

/**
 * Hook for expensive initial computations that should only run once.
 */
export function useLazyInit<T>(factory: () => T): T {
  const ref = useRef<{ value: T; initialized: boolean }>({ value: undefined as T, initialized: false });

  if (!ref.current.initialized) {
    ref.current.value = factory();
    ref.current.initialized = true;
  }

  return ref.current.value;
}

// ─── Batched state updates ───

/**
 * Batches multiple state updates to reduce re-renders.
 */
export function useBatchedState<T extends Record<string, unknown>>(
  initialState: T,
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState<T>(initialState);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return [state, batchUpdate];
}

// ─── Pagination hook ───

/**
 * Simple pagination for lists to avoid rendering all items at once.
 */
export function usePagination<T>(items: T[], pageSize = 20): {
  visibleItems: T[];
  loadMore: () => void;
  hasMore: boolean;
  page: number;
} {
  const [page, setPage] = useState(1);

  const visibleItems = useMemo(
    () => items.slice(0, page * pageSize),
    [items, page, pageSize],
  );

  const hasMore = visibleItems.length < items.length;

  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  // Reset page when items change
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  return { visibleItems, loadMore, hasMore, page };
}

// ─── Performance measurement ───

export type PerfMeasurement = {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
};

const _measurements: PerfMeasurement[] = [];

export function startMeasure(name: string): () => PerfMeasurement {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    const measurement: PerfMeasurement = {
      name,
      startTime,
      endTime,
      duration: endTime - startTime,
    };
    _measurements.push(measurement);
    if (_measurements.length > 100) _measurements.shift();

    if (__DEV__ && measurement.duration > 16) {
      // eslint-disable-next-line no-console
      console.warn(`[perf] Slow operation: ${name} took ${measurement.duration.toFixed(1)}ms`);
    }

    return measurement;
  };
}

export function getMeasurements(): PerfMeasurement[] {
  return [..._measurements];
}

export function clearMeasurements(): void {
  _measurements.length = 0;
}

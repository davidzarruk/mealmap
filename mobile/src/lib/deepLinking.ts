/**
 * F8-004: Deep linking configuration
 *
 * Supports sharing plans and meals by URL using expo-linking.
 * URL scheme: mealmap:// and https://mealmap.app/
 */

import { LinkingOptions } from '@react-navigation/native';
import { Linking, Share } from 'react-native';

// ─── Linking config for React Navigation ───

export const linkingConfig: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: ['mealmap://', 'https://mealmap.app'],
  config: {
    screens: {
      App: {
        screens: {
          MainTabs: {
            screens: {
              Plan: 'plan',
              Shopping: 'shopping',
              Insights: 'insights',
              Profile: 'profile',
            },
          },
          Setup: 'setup',
          PlanHistory: 'history',
          MealDetails: {
            path: 'meal/:slotId',
            parse: {
              slotId: (slotId: string) => slotId,
            },
          },
        },
      },
      Auth: {
        screens: {
          SignIn: 'signin',
          SignUp: 'signup',
        },
      },
    },
  },
};

// ─── Share helpers ───

const APP_URL_BASE = 'https://mealmap.app';

export function buildPlanUrl(planId: string): string {
  return `${APP_URL_BASE}/plan?id=${encodeURIComponent(planId)}`;
}

export function buildMealUrl(slotId: string, title: string): string {
  return `${APP_URL_BASE}/meal/${encodeURIComponent(slotId)}?title=${encodeURIComponent(title)}`;
}

export async function sharePlan(planId: string): Promise<void> {
  const url = buildPlanUrl(planId);
  try {
    await Share.share({
      message: `Check out my meal plan on Mealmap! ${url}`,
      url,
    });
  } catch {
    // user cancelled
  }
}

export async function shareMeal(slotId: string, title: string): Promise<void> {
  const url = buildMealUrl(slotId, title);
  try {
    await Share.share({
      message: `Check out this meal: ${title} — ${url}`,
      url,
    });
  } catch {
    // user cancelled
  }
}

/**
 * Parse an incoming deep link URL to extract route info.
 */
export function parseDeepLink(url: string): { screen: string; params?: Record<string, string> } | null {
  try {
    const parsed = new URL(url.replace('mealmap://', 'https://mealmap.app/'));
    const path = parsed.pathname.replace(/^\//, '');

    if (path.startsWith('meal/')) {
      const slotId = path.replace('meal/', '');
      return { screen: 'MealDetails', params: { slotId, title: parsed.searchParams.get('title') ?? '' } };
    }

    if (path === 'plan') {
      return { screen: 'Plan', params: { id: parsed.searchParams.get('id') ?? '' } };
    }

    if (path === 'shopping') return { screen: 'Shopping' };
    if (path === 'profile') return { screen: 'Profile' };
    if (path === 'history') return { screen: 'PlanHistory' };

    return null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to incoming deep links.
 */
export function onDeepLink(callback: (link: { screen: string; params?: Record<string, string> }) => void): () => void {
  const handler = ({ url }: { url: string }) => {
    const parsed = parseDeepLink(url);
    if (parsed) callback(parsed);
  };

  const sub = Linking.addEventListener('url', handler);

  // Also handle initial URL
  Linking.getInitialURL().then((url) => {
    if (url) handler({ url });
  });

  return () => sub.remove();
}

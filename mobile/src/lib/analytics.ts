import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = 'mealmap/analytics-events';

export type AnalyticsEventName = 'plan_created' | 'meal_swapped' | 'list_generated' | 'perf_budget_exceeded' | 'app_error';

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  at: string;
  payload?: Record<string, unknown>;
};

export async function trackEvent(name: AnalyticsEventName, payload?: Record<string, unknown>): Promise<void> {
  const event: AnalyticsEvent = {
    name,
    at: new Date().toISOString(),
    payload,
  };

  try {
    const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
    const prev = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    prev.push(event);
    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(prev.slice(-200)));
  } catch {
    // non-blocking analytics fallback
  }

  // Keep debug output visible in Expo logs while no remote analytics sink exists.
  // eslint-disable-next-line no-console
  console.log('[analytics]', event.name, event.payload ?? {});
}

export async function getAnalyticsEvents(limit = 50): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
    const events = raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
    return events.slice(-Math.max(1, limit)).reverse();
  } catch {
    return [];
  }
}

export async function getAnalyticsSummary(): Promise<Record<AnalyticsEventName, number>> {
  const summary: Record<AnalyticsEventName, number> = {
    plan_created: 0,
    meal_swapped: 0,
    list_generated: 0,
    perf_budget_exceeded: 0,
    app_error: 0,
  };

  const events = await getAnalyticsEvents(200);
  events.forEach((event) => {
    summary[event.name] = (summary[event.name] ?? 0) + 1;
  });

  return summary;
}

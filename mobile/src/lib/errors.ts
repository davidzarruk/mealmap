import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent } from './analytics';

const ERROR_LOG_KEY = 'mealmap/error-log';

export type AppErrorLog = {
  at: string;
  source: string;
  message: string;
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

export async function logAppError(source: string, error: unknown): Promise<void> {
  const message = getErrorMessage(error);
  const item: AppErrorLog = {
    at: new Date().toISOString(),
    source,
    message,
  };

  try {
    const raw = await AsyncStorage.getItem(ERROR_LOG_KEY);
    const prev = raw ? (JSON.parse(raw) as AppErrorLog[]) : [];
    prev.push(item);
    await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(prev.slice(-100)));
  } catch {
    // non-blocking log
  }

  trackEvent('app_error', {
    source,
    message,
  }).catch(() => undefined);

  console.error(`[app_error] ${source}: ${message}`);
}

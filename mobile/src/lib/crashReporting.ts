/**
 * F10-009: Crash Reporting Stub (Sentry-compatible interface)
 *
 * Configuration stub — NO real Sentry SDK. Ships with a console-only
 * implementation. Replace with the real Sentry RN SDK when ready.
 */

// ─── Types ───

export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export type CrashReportingConfig = {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release?: string;
  dist?: string;
  debug?: boolean;
  tracesSampleRate?: number;
  enableAutoSessionTracking?: boolean;
  enabled?: boolean;
};

export type Breadcrumb = {
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  level?: SeverityLevel;
  timestamp?: number;
};

export type UserContext = {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
};

// ─── State ───

let _config: CrashReportingConfig | null = null;
let _user: UserContext | null = null;
const _breadcrumbs: Breadcrumb[] = [];
const _tags: Record<string, string> = {};
const MAX_BREADCRUMBS = 100;

// ─── Core API (Sentry-compatible interface) ───

/**
 * Initialize crash reporting. Call once at app startup.
 * Currently logs to console; swap implementation for real Sentry.
 */
export function initCrashReporting(config: CrashReportingConfig): void {
  _config = config;
  if (config.debug) {
    console.log('[CrashReporting] Initialized (STUB)', {
      dsn: config.dsn ? '***' : 'none',
      environment: config.environment,
      release: config.release,
    });
  }
}

/**
 * Capture an exception and send to crash reporting service.
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>,
): string {
  const eventId = generateEventId();
  const entry = {
    eventId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    user: _user,
    tags: { ..._tags },
    breadcrumbs: [..._breadcrumbs],
    timestamp: new Date().toISOString(),
  };

  if (_config?.debug !== false) {
    console.error('[CrashReporting] captureException', entry);
  }

  return eventId;
}

/**
 * Capture a message (non-error event).
 */
export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
): string {
  const eventId = generateEventId();

  if (_config?.debug !== false) {
    console.log(`[CrashReporting] captureMessage [${level}]`, message);
  }

  return eventId;
}

/**
 * Add a breadcrumb for debugging context.
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  _breadcrumbs.push({
    ...breadcrumb,
    timestamp: breadcrumb.timestamp ?? Date.now() / 1000,
  });

  if (_breadcrumbs.length > MAX_BREADCRUMBS) {
    _breadcrumbs.shift();
  }
}

/**
 * Set user context for crash reports.
 */
export function setUser(user: UserContext | null): void {
  _user = user;
  if (_config?.debug) {
    console.log('[CrashReporting] setUser', user?.id ?? 'cleared');
  }
}

/**
 * Set a tag for all future events.
 */
export function setTag(key: string, value: string): void {
  _tags[key] = value;
}

/**
 * Set extra context data.
 */
export function setExtra(key: string, value: unknown): void {
  _tags[`extra.${key}`] = String(value);
}

/**
 * Wrap a function with error capturing.
 */
export function wrap<T extends (...args: unknown[]) => unknown>(fn: T): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((err: unknown) => {
          captureException(err);
          throw err;
        });
      }
      return result;
    } catch (err) {
      captureException(err);
      throw err;
    }
  }) as T;
}

/**
 * Check if crash reporting is initialized.
 */
export function isInitialized(): boolean {
  return _config !== null;
}

/**
 * Get current config (for debugging).
 */
export function getConfig(): CrashReportingConfig | null {
  return _config ? { ..._config } : null;
}

// ─── Helpers ───

function generateEventId(): string {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16),
  );
}

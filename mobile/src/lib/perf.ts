import { trackEvent } from './analytics';

const DEFAULT_BUDGET_MS = 2500;

const BUDGETS_MS_BY_LABEL: Record<string, number> = {
  'auth.signInWithPassword': 1800,
  'auth.signUp': 2200,
  'plan.loadWeekPlan': 800,
  'plan.saveWeekPlan': 1000,
};

function resolveBudgetMs(label: string): number {
  return BUDGETS_MS_BY_LABEL[label] ?? DEFAULT_BUDGET_MS;
}

export async function measureAsync<T>(label: string, task: () => Promise<T>): Promise<T> {
  const startedAt = Date.now();
  const budgetMs = resolveBudgetMs(label);

  try {
    return await task();
  } finally {
    const elapsedMs = Date.now() - startedAt;

    if (elapsedMs > budgetMs) {
      console.warn(`[perf] Budget exceeded: ${label} took ${elapsedMs}ms (budget ${budgetMs}ms)`);
      trackEvent('perf_budget_exceeded', {
        label,
        elapsedMs,
        budgetMs,
      }).catch(() => undefined);
    } else if (elapsedMs > 1200) {
      console.warn(`[perf] Slow action detected: ${label} took ${elapsedMs}ms`);
    }
  }
}

export function getPerfBudgets(): Record<string, number> {
  return {
    ...BUDGETS_MS_BY_LABEL,
    default: DEFAULT_BUDGET_MS,
  };
}

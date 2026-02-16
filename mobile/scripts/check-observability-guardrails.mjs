#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.cwd(), 'src', 'lib');
const perfPath = path.join(root, 'perf.ts');
const analyticsPath = path.join(root, 'analytics.ts');

const [perfSrc, analyticsSrc] = await Promise.all([readFile(perfPath, 'utf8'), readFile(analyticsPath, 'utf8')]);

const checks = [
  {
    name: 'perf budgets declared',
    ok: perfSrc.includes('BUDGETS_MS_BY_LABEL'),
  },
  {
    name: 'budget exceed event tracked',
    ok: perfSrc.includes("trackEvent('perf_budget_exceeded'"),
  },
  {
    name: 'app error analytics event available',
    ok: analyticsSrc.includes("'app_error'"),
  },
  {
    name: 'perf analytics event available',
    ok: analyticsSrc.includes("'perf_budget_exceeded'"),
  },
];

const failed = checks.filter((item) => !item.ok);
if (failed.length > 0) {
  console.error('❌ observability guardrails check failed');
  failed.forEach((item) => console.error(` - ${item.name}`));
  process.exit(1);
}

console.log('✅ observability guardrails check passed');
checks.forEach((item) => console.log(` - ${item.name}`));

#!/usr/bin/env node
/**
 * F4-006 — Preflight check for Kanban Supabase tables.
 * Verifies: tickets table, ticket_events table, auth sign-in viability.
 * Usage: node scripts/preflight-kanban-supabase.mjs [--email user@x.com --password pass]
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), 'mobile/.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const url = (env.match(/^EXPO_PUBLIC_SUPABASE_URL=(.+)$/m) || [])[1]?.trim();
const anonKey = (env.match(/^EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m) || [])[1]?.trim();

if (!url || !anonKey) {
  console.error('❌ Missing SUPABASE_URL or ANON_KEY in mobile/.env.local');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
const results = { tables: {}, auth: null };

// 1. Check tickets table
const { data: tData, error: tErr } = await supabase.from('tickets').select('id').limit(1);
results.tables.tickets = tErr ? `❌ ${tErr.code}: ${tErr.message}` : `✅ accessible (${tData.length} rows sampled)`;

// 2. Check ticket_events table
const { data: eData, error: eErr } = await supabase.from('ticket_events').select('id').limit(1);
results.tables.ticket_events = eErr ? `❌ ${eErr.code}: ${eErr.message}` : `✅ accessible (${eData.length} rows sampled)`;

// 3. Try auth sign-in if credentials provided
const args = process.argv.slice(2);
const emailIdx = args.indexOf('--email');
const passIdx = args.indexOf('--password');
if (emailIdx >= 0 && passIdx >= 0) {
  const email = args[emailIdx + 1];
  const password = args[passIdx + 1];
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
  if (authErr) {
    results.auth = `❌ sign-in failed: ${authErr.message}`;
  } else {
    results.auth = `✅ signed in as ${authData.user.id} (${authData.user.email})`;
    // Re-check tables with auth context
    const { data: tAuth, error: tAuthErr } = await supabase.from('tickets').select('id').limit(1);
    results.tables.tickets_authed = tAuthErr ? `❌ ${tAuthErr.code}: ${tAuthErr.message}` : `✅ with auth: ${tAuth.length} rows`;
    const { data: eAuth, error: eAuthErr } = await supabase.from('ticket_events').select('id').limit(1);
    results.tables.ticket_events_authed = eAuthErr ? `❌ ${eAuthErr.code}: ${eAuthErr.message}` : `✅ with auth: ${eAuth.length} rows`;
  }
} else {
  results.auth = '⏭️  skipped (pass --email x --password y to test)';
}

console.log('\n=== Kanban Supabase Preflight ===');
console.log(`URL: ${url}`);
for (const [k, v] of Object.entries(results.tables)) {
  console.log(`  ${k}: ${v}`);
}
console.log(`  auth: ${results.auth}`);

const hasMissingTable = Object.values(results.tables).some((v) => v.startsWith('❌'));
if (hasMissingTable) {
  console.log('\n⚠️  MIGRATION NOT APPLIED — run 20260216092000_kanban_live.sql via Supabase Dashboard SQL Editor or CLI.');
}
console.log('');

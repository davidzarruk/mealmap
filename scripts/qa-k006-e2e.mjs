#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const STATUS_BY_SECTION = {
  Backlog: 'backlog',
  Next: 'next',
  'In Progress': 'in_progress',
  'In Review': 'in_review',
  QA: 'qa',
  Done: 'done',
};

function parseMeta(raw = '') {
  const meta = {};
  for (const part of raw.split(',')) {
    const [k, ...rest] = part.split(':');
    if (!k || !rest.length) continue;
    meta[k.trim()] = rest.join(':').trim();
  }
  return meta;
}

function toIsoOrNull(value) {
  if (!value) return null;
  const d = new Date(value.replace(' UTC', 'Z'));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseBoard(boardText) {
  const tickets = [];
  const lines = boardText.split('\n');
  let section = null;

  for (const line of lines) {
    const secMatch = line.match(/^##\s+(Backlog|Next|In Progress|In Review|QA|Done)$/);
    if (secMatch) {
      section = secMatch[1];
      continue;
    }
    if (line.startsWith('---')) break;
    if (!section) continue;

    const m = line.match(/^- \[(x| )\] ([A-Z0-9-]+) (.+?)(?: _\((.+)\)_)?$/);
    if (!m) continue;

    const [, checked, id, rawTitle, rawMeta] = m;
    const meta = parseMeta(rawMeta);
    const title = rawTitle.split(' — ')[0].trim();

    tickets.push({
      id,
      title,
      status: checked === 'x' ? 'done' : STATUS_BY_SECTION[section],
      role: id.split('-')[0] || null,
      assignee: null,
      priority: id.startsWith('K-') ? 'P0' : 'P2',
      description: rawTitle.trim(),
      created_at: toIsoOrNull(meta.created_at),
      completed_at: toIsoOrNull(meta.completed_at),
      updated_at: new Date().toISOString(),
    });
  }

  return tickets;
}

async function main() {
  const root = path.resolve(process.cwd());
  const boardPath = path.join(root, 'board.md');
  const envPath = path.join(root, 'mobile/.env.local');

  const env = fs.readFileSync(envPath, 'utf8');
  const url = (env.match(/^EXPO_PUBLIC_SUPABASE_URL=(.+)$/m) || [])[1];
  const anon = (env.match(/^EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m) || [])[1];
  if (!url || !anon) throw new Error('Missing Supabase URL/anon key in mobile/.env.local');

  // F4-006: Prefer sign-in with existing credentials (env vars) to avoid rate-limit.
  // Fall back to sign-up only if no credentials provided.
  const supabase = createClient(url, anon);
  let session = null;

  const existingEmail = process.env.QA_EMAIL;
  const existingPassword = process.env.QA_PASSWORD;

  if (existingEmail && existingPassword) {
    console.log(`Signing in with existing user: ${existingEmail}`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: existingEmail,
      password: existingPassword,
    });
    if (signInError) throw new Error(`Sign-in failed: ${signInError.message}. Provide valid QA_EMAIL/QA_PASSWORD.`);
    session = signInData.session;
  } else {
    console.log('No QA_EMAIL/QA_PASSWORD — attempting sign-up (may hit rate limit)...');
    const email = `k${Date.now()}@gmail.com`;
    const password = `Mealmap#${Math.random().toString(36).slice(2, 10)}A1`;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) throw new Error(`Sign-up failed (rate limit?): ${signUpError.message}. Set QA_EMAIL + QA_PASSWORD env vars to use existing user.`);

    session = signUpData.session;
    if (!session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error(`Sign-up created user but sign-in failed: ${signInError.message}`);
      session = signInData.session;
    }
  }

  if (!session?.user?.id) throw new Error('No authenticated user session available for QA');
  const ownerId = session.user.id;

  const board = fs.readFileSync(boardPath, 'utf8');
  const parsedTickets = parseBoard(board).map((t) => ({ ...t, owner_id: ownerId }));

  const { error: upsertError } = await supabase
    .from('tickets')
    .upsert(parsedTickets, { onConflict: 'id' });
  if (upsertError) throw upsertError;

  // Insert initial sync event if missing per ticket
  for (const t of parsedTickets) {
    const note = 'Initial sync from board.md (K-006 QA)';
    const { data: existing, error: e1 } = await supabase
      .from('ticket_events')
      .select('id')
      .eq('ticket_id', t.id)
      .eq('owner_id', ownerId)
      .eq('note', note)
      .limit(1);
    if (e1) throw e1;
    if (!existing?.length) {
      const { error: e2 } = await supabase.from('ticket_events').insert({
        ticket_id: t.id,
        owner_id: ownerId,
        from_status: null,
        to_status: t.status,
        changed_by: 'qa-k006-script',
        note,
      });
      if (e2) throw e2;
    }
  }

  const { data: ticketCountData, error: cErr } = await supabase
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', ownerId);
  if (cErr) throw cErr;

  // Realtime verification with second client/session
  const listener = createClient(url, anon);
  await listener.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  let realtimeReceived = false;
  const realtimePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Realtime event timeout')), 12000);
    listener
      .channel(`k006-qa-${Date.now()}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `owner_id=eq.${ownerId}`,
      }, () => {
        realtimeReceived = true;
        clearTimeout(timeout);
        resolve(true);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { error: updErr } = await supabase
            .from('tickets')
            .update({ status: 'in_progress', updated_at: new Date().toISOString() })
            .eq('id', 'K-006')
            .eq('owner_id', ownerId);
          if (updErr) {
            clearTimeout(timeout);
            reject(updErr);
          }
        }
      });
  });

  await realtimePromise;

  const result = {
    qa_run_at: new Date().toISOString(),
    supabase_url: url,
    owner_id: ownerId,
    email,
    password,
    synced_tickets: parsedTickets.length,
    realtime_received: realtimeReceived,
    ui_test_target: 'kanban-web (browser)',
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

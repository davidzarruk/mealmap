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
      created_at: toIsoOrNull(meta.created_at) || new Date().toISOString(),
      completed_at: toIsoOrNull(meta.completed_at),
      updated_at: new Date().toISOString(),
    });
  }

  return tickets;
}

async function main() {
  const projectRoot = path.resolve(process.cwd());
  const boardPath = path.join(projectRoot, 'board.md');

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ownerId = process.env.SUPABASE_OWNER_ID;

  if (!url || !serviceRoleKey || !ownerId) {
    throw new Error('Missing env vars. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_OWNER_ID');
  }

  const board = fs.readFileSync(boardPath, 'utf8');
  const allTickets = parseBoard(board).map((t) => ({ ...t, owner_id: ownerId }));
  // Deduplicate by id — last occurrence wins (Done section comes last, so it takes priority)
  const deduped = new Map();
  for (const t of allTickets) deduped.set(t.id, t);
  const parsedTickets = [...deduped.values()];

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: upsertError } = await supabase
    .from('tickets')
    .upsert(parsedTickets, { onConflict: 'id' });

  if (upsertError) throw upsertError;

  const events = parsedTickets.map((t) => ({
    ticket_id: t.id,
    owner_id: ownerId,
    from_status: null,
    to_status: t.status,
    changed_by: 'sync-board-script',
    note: 'Initial sync from board.md',
    changed_at: new Date().toISOString(),
  }));

  // idempotent-ish event insert: skip if initial sync event already exists
  for (const ev of events) {
    const { data: existing, error: existingError } = await supabase
      .from('ticket_events')
      .select('id')
      .eq('ticket_id', ev.ticket_id)
      .eq('note', ev.note)
      .limit(1);
    if (existingError) throw existingError;
    if (!existing || existing.length === 0) {
      const { error: insertError } = await supabase.from('ticket_events').insert(ev);
      if (insertError) throw insertError;
    }
  }

  console.log(`Synced ${parsedTickets.length} tickets from board.md to Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

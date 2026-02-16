import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = localStorage.getItem('KANBAN_SUPABASE_URL') || prompt('Supabase URL');
const SUPABASE_ANON_KEY = localStorage.getItem('KANBAN_SUPABASE_ANON_KEY') || prompt('Supabase anon key');
const CHANGED_BY = localStorage.getItem('KANBAN_CHANGED_BY') || 'kanban-web';

localStorage.setItem('KANBAN_SUPABASE_URL', SUPABASE_URL || '');
localStorage.setItem('KANBAN_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY || '');
localStorage.setItem('KANBAN_CHANGED_BY', CHANGED_BY || '');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Auth: sign in to get owner_id from session (F4-006 mitigation) ---
let OWNER_ID = null;
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) {
  OWNER_ID = session.user.id;
  document.getElementById('status').textContent = `Signed in as ${session.user.email}`;
} else {
  const email = prompt('Email (Supabase auth user)');
  const password = prompt('Password');
  if (email && password) {
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) {
      document.getElementById('status').textContent = `Auth failed: ${authErr.message}. Falling back to manual owner_id.`;
      OWNER_ID = localStorage.getItem('KANBAN_OWNER_ID') || prompt('Owner user UUID (auth.uid)');
      localStorage.setItem('KANBAN_OWNER_ID', OWNER_ID || '');
    } else {
      OWNER_ID = authData.user.id;
      document.getElementById('status').textContent = `Signed in as ${authData.user.email}`;
    }
  } else {
    OWNER_ID = localStorage.getItem('KANBAN_OWNER_ID') || prompt('Owner user UUID (auth.uid)');
    localStorage.setItem('KANBAN_OWNER_ID', OWNER_ID || '');
  }
}
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const template = document.getElementById('ticket-template');

const columns = [
  ['backlog', 'Backlog'],
  ['next', 'Next'],
  ['in_progress', 'In Progress'],
  ['in_review', 'In Review'],
  ['qa', 'QA'],
  ['done', 'Done'],
];

function fmtDate(v) {
  if (!v) return '-';
  return new Date(v).toLocaleString();
}

function render(tickets) {
  boardEl.innerHTML = '';

  for (const [statusKey, statusLabel] of columns) {
    const col = document.createElement('section');
    col.className = 'column';
    col.innerHTML = `<h2>${statusLabel}</h2>`;

    tickets
      .filter((t) => t.status === statusKey)
      .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
      .forEach((t) => {
        const node = template.content.firstElementChild.cloneNode(true);
        node.querySelector('.ticket-id').textContent = `${t.id} · ${t.role || 'N/A'} · ${t.priority || 'N/A'}`;
        node.querySelector('.ticket-title').textContent = t.title;
        node.querySelector('.ticket-meta').textContent = `updated: ${fmtDate(t.updated_at)} | completed: ${fmtDate(t.completed_at)}`;

        const select = node.querySelector('.status-select');
        for (const [optVal, optLabel] of columns) {
          const opt = document.createElement('option');
          opt.value = optVal;
          opt.textContent = optLabel;
          opt.selected = optVal === t.status;
          select.appendChild(opt);
        }

        select.addEventListener('change', async (ev) => {
          const toStatus = ev.target.value;
          const fromStatus = t.status;
          if (toStatus === fromStatus) return;

          const completedAt = toStatus === 'done' ? new Date().toISOString() : null;

          const { error: updateErr } = await supabase
            .from('tickets')
            .update({
              status: toStatus,
              completed_at: completedAt,
              updated_at: new Date().toISOString(),
            })
            .eq('id', t.id)
            .eq('owner_id', OWNER_ID);

          if (updateErr) {
            statusEl.textContent = `Error updating ${t.id}: ${updateErr.message}`;
            ev.target.value = fromStatus;
            return;
          }

          const { error: eventErr } = await supabase.from('ticket_events').insert({
            ticket_id: t.id,
            owner_id: OWNER_ID,
            from_status: fromStatus,
            to_status: toStatus,
            changed_by: CHANGED_BY,
            note: 'Status changed from web kanban',
            changed_at: new Date().toISOString(),
          });

          if (eventErr) {
            statusEl.textContent = `Warning: status moved but event failed for ${t.id}: ${eventErr.message}`;
            return;
          }

          statusEl.textContent = `Moved ${t.id}: ${fromStatus} → ${toStatus}`;
        });

        col.appendChild(node);
      });

    boardEl.appendChild(col);
  }
}

async function loadTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('owner_id', OWNER_ID)
    .order('updated_at', { ascending: true });

  if (error) {
    statusEl.textContent = `Load error: ${error.message}`;
    return;
  }

  statusEl.textContent = `Connected · ${data.length} tickets`;
  render(data);
}

supabase
  .channel('kanban-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => loadTickets())
  .subscribe((state) => {
    statusEl.textContent = `Realtime: ${state}`;
  });

await loadTickets();

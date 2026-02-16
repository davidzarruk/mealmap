-- Kanban Live V1 schema for board/ticket tracking

create extension if not exists "pgcrypto";

-- keep helper if migration run standalone
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tickets (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null check (status in ('backlog', 'next', 'in_progress', 'in_review', 'qa', 'done')),
  role text,
  assignee text,
  priority text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null references public.tickets(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  from_status text check (from_status in ('backlog', 'next', 'in_progress', 'in_review', 'qa', 'done')),
  to_status text not null check (to_status in ('backlog', 'next', 'in_progress', 'in_review', 'qa', 'done')),
  changed_by text,
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists idx_tickets_owner_status on public.tickets(owner_id, status);
create index if not exists idx_tickets_updated_at on public.tickets(updated_at desc);
create index if not exists idx_tickets_role on public.tickets(role);
create index if not exists idx_tickets_assignee on public.tickets(assignee);
create index if not exists idx_ticket_events_ticket_changed_at on public.ticket_events(ticket_id, changed_at desc);
create index if not exists idx_ticket_events_owner_changed_at on public.ticket_events(owner_id, changed_at desc);

create trigger trg_tickets_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();

create or replace function public.set_completed_at_from_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'done' and old.status is distinct from 'done' then
    new.completed_at = coalesce(new.completed_at, now());
  elsif new.status <> 'done' and old.status = 'done' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger trg_tickets_completed_at
before update on public.tickets
for each row
execute function public.set_completed_at_from_status();

alter table public.tickets enable row level security;
alter table public.ticket_events enable row level security;

create policy "tickets_select_own"
on public.tickets
for select
using (owner_id = auth.uid());

create policy "tickets_insert_own"
on public.tickets
for insert
with check (owner_id = auth.uid());

create policy "tickets_update_own"
on public.tickets
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "tickets_delete_own"
on public.tickets
for delete
using (owner_id = auth.uid());

create policy "ticket_events_select_own"
on public.ticket_events
for select
using (owner_id = auth.uid());

create policy "ticket_events_insert_own"
on public.ticket_events
for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.tickets t
    where t.id = ticket_events.ticket_id
      and t.owner_id = auth.uid()
  )
);

-- Enable realtime streaming for kanban tables
alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.ticket_events;

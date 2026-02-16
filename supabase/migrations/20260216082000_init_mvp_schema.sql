-- Mealmap MVP initial schema
-- Stack: Expo + TypeScript + Supabase
-- Horizon default remains weekly blocks (month = batches of weeks)

create extension if not exists "pgcrypto";

-- Generic updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Optional profile mirror for auth.users metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  region text not null default 'CO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  horizon text not null check (horizon in ('week', 'month_batch')),
  people_count int not null check (people_count between 1 and 6),
  meal_types text[] not null default array['lunch']::text[],
  cooking_level text not null check (cooking_level in ('easy', 'intermediate', 'advanced')),
  max_time_minutes int not null check (max_time_minutes in (15, 30, 45, 60)),
  region text not null default 'CO',
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_plans_user_id on public.plans(user_id);
create index if not exists idx_plans_status on public.plans(status);

create trigger trg_plans_updated_at
before update on public.plans
for each row
execute function public.set_updated_at();

create table if not exists public.plan_slots (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  day_index int not null check (day_index between 0 and 6),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  approved_meal_candidate_id uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, day_index, meal_type)
);

create index if not exists idx_plan_slots_plan_id on public.plan_slots(plan_id);

create trigger trg_plan_slots_updated_at
before update on public.plan_slots
for each row
execute function public.set_updated_at();

create table if not exists public.meal_candidates (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.plan_slots(id) on delete cascade,
  title text not null,
  ingredients_json jsonb not null,
  prep_steps_short text,
  est_time_minutes int check (est_time_minutes > 0),
  tags text[] not null default '{}',
  source text not null default 'seed' check (source in ('seed', 'llm')),
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_meal_candidates_slot_id on public.meal_candidates(slot_id);
create index if not exists idx_meal_candidates_current on public.meal_candidates(slot_id, is_current);

alter table public.plan_slots
  add constraint fk_plan_slots_approved_candidate
  foreign key (approved_meal_candidate_id)
  references public.meal_candidates(id)
  on delete set null;

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null unique references public.plans(id) on delete cascade,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_shopping_lists_plan_id on public.shopping_lists(plan_id);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  ingredient_name text not null,
  unit text,
  total_qty numeric(10,2),
  category text not null default 'other',
  created_at timestamptz not null default now()
);

create index if not exists idx_shopping_items_list_id on public.shopping_items(shopping_list_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_slots enable row level security;
alter table public.meal_candidates enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;

-- Ownership helper predicates use auth.uid()
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "plans_select_own"
on public.plans
for select
using (user_id = auth.uid());

create policy "plans_insert_own"
on public.plans
for insert
with check (user_id = auth.uid());

create policy "plans_update_own"
on public.plans
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "plans_delete_own"
on public.plans
for delete
using (user_id = auth.uid());

create policy "plan_slots_select_by_plan_owner"
on public.plan_slots
for select
using (
  exists (
    select 1 from public.plans p
    where p.id = plan_slots.plan_id
      and p.user_id = auth.uid()
  )
);

create policy "plan_slots_insert_by_plan_owner"
on public.plan_slots
for insert
with check (
  exists (
    select 1 from public.plans p
    where p.id = plan_slots.plan_id
      and p.user_id = auth.uid()
  )
);

create policy "plan_slots_update_by_plan_owner"
on public.plan_slots
for update
using (
  exists (
    select 1 from public.plans p
    where p.id = plan_slots.plan_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.plans p
    where p.id = plan_slots.plan_id
      and p.user_id = auth.uid()
  )
);

create policy "meal_candidates_select_by_plan_owner"
on public.meal_candidates
for select
using (
  exists (
    select 1
    from public.plan_slots s
    join public.plans p on p.id = s.plan_id
    where s.id = meal_candidates.slot_id
      and p.user_id = auth.uid()
  )
);

create policy "meal_candidates_insert_by_plan_owner"
on public.meal_candidates
for insert
with check (
  exists (
    select 1
    from public.plan_slots s
    join public.plans p on p.id = s.plan_id
    where s.id = meal_candidates.slot_id
      and p.user_id = auth.uid()
  )
);

create policy "meal_candidates_update_by_plan_owner"
on public.meal_candidates
for update
using (
  exists (
    select 1
    from public.plan_slots s
    join public.plans p on p.id = s.plan_id
    where s.id = meal_candidates.slot_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.plan_slots s
    join public.plans p on p.id = s.plan_id
    where s.id = meal_candidates.slot_id
      and p.user_id = auth.uid()
  )
);

create policy "shopping_lists_select_by_plan_owner"
on public.shopping_lists
for select
using (
  exists (
    select 1 from public.plans p
    where p.id = shopping_lists.plan_id
      and p.user_id = auth.uid()
  )
);

create policy "shopping_lists_insert_by_plan_owner"
on public.shopping_lists
for insert
with check (
  exists (
    select 1 from public.plans p
    where p.id = shopping_lists.plan_id
      and p.user_id = auth.uid()
  )
);

create policy "shopping_items_select_by_list_owner"
on public.shopping_items
for select
using (
  exists (
    select 1
    from public.shopping_lists sl
    join public.plans p on p.id = sl.plan_id
    where sl.id = shopping_items.shopping_list_id
      and p.user_id = auth.uid()
  )
);

create policy "shopping_items_insert_by_list_owner"
on public.shopping_items
for insert
with check (
  exists (
    select 1
    from public.shopping_lists sl
    join public.plans p on p.id = sl.plan_id
    where sl.id = shopping_items.shopping_list_id
      and p.user_id = auth.uid()
  )
);

create policy "shopping_items_update_by_list_owner"
on public.shopping_items
for update
using (
  exists (
    select 1
    from public.shopping_lists sl
    join public.plans p on p.id = sl.plan_id
    where sl.id = shopping_items.shopping_list_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shopping_lists sl
    join public.plans p on p.id = sl.plan_id
    where sl.id = shopping_items.shopping_list_id
      and p.user_id = auth.uid()
  )
);

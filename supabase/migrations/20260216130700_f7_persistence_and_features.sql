-- F7 Migration: meal persistence, weekly plans, shopping checkboxes, ratings, dietary tags
-- Depends on: 20260216082000_init_mvp_schema.sql

-- F7-003: Add checked column to shopping_items
alter table public.shopping_items add column if not exists checked boolean not null default false;

-- F7-005: Meal ratings (thumbs up/down)
create table if not exists public.meal_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_candidate_id uuid not null references public.meal_candidates(id) on delete cascade,
  rating smallint not null check (rating in (-1, 1)), -- -1 = thumbs down, 1 = thumbs up
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, meal_candidate_id)
);

create index if not exists idx_meal_ratings_user on public.meal_ratings(user_id);
create index if not exists idx_meal_ratings_candidate on public.meal_ratings(meal_candidate_id);

create trigger trg_meal_ratings_updated_at
before update on public.meal_ratings
for each row
execute function public.set_updated_at();

alter table public.meal_ratings enable row level security;

create policy "meal_ratings_select_own" on public.meal_ratings for select using (user_id = auth.uid());
create policy "meal_ratings_insert_own" on public.meal_ratings for insert with check (user_id = auth.uid());
create policy "meal_ratings_update_own" on public.meal_ratings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "meal_ratings_delete_own" on public.meal_ratings for delete using (user_id = auth.uid());

-- F7-006: Dietary tags on meal_candidates
alter table public.meal_candidates add column if not exists dietary_tags text[] not null default '{}';

-- F7-006: User dietary preferences/filters
create table if not exists public.user_dietary_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  unique (user_id, tag)
);

create index if not exists idx_user_dietary_filters_user on public.user_dietary_filters(user_id);

alter table public.user_dietary_filters enable row level security;

create policy "user_dietary_filters_select_own" on public.user_dietary_filters for select using (user_id = auth.uid());
create policy "user_dietary_filters_insert_own" on public.user_dietary_filters for insert with check (user_id = auth.uid());
create policy "user_dietary_filters_delete_own" on public.user_dietary_filters for delete using (user_id = auth.uid());

-- Enable realtime for new tables
alter publication supabase_realtime add table public.meal_ratings;
alter publication supabase_realtime add table public.user_dietary_filters;

-- Also enable realtime for existing tables used by F7-001/002/003
alter publication supabase_realtime add table public.plans;
alter publication supabase_realtime add table public.plan_slots;
alter publication supabase_realtime add table public.meal_candidates;
alter publication supabase_realtime add table public.shopping_lists;
alter publication supabase_realtime add table public.shopping_items;

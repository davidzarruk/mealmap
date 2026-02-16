# Mealmap Kanban Live V1 (Supabase Realtime)

This is a minimal browser kanban board backed by Supabase.

## What it does
- Renders columns: Backlog, Next, In Progress, In Review, QA, Done.
- Loads tickets from `public.tickets`.
- Uses Supabase Realtime (`postgres_changes`) to update without browser refresh.
- Lets you move ticket status with a selector.
- Persists status change in `tickets` and logs event in `ticket_events`.

## Prerequisites
1. Apply SQL migrations in `mealmap/supabase/migrations` (including `20260216092000_kanban_live.sql`) in your Supabase project.
2. Have a valid authenticated user (`owner_id`) and know its UUID.

## Run locally
From repository root:

```bash
cd mealmap/kanban-web
python3 -m http.server 4173
```

Then open:
`http://localhost:4173`

On first load, the app prompts for:
- Supabase URL
- Supabase anon key
- Owner user UUID

Values are saved in `localStorage` for next runs.

## Initial board sync from `board.md`
Use the script from `mealmap/`:

```bash
cd mealmap
SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
SUPABASE_OWNER_ID="AUTH_USER_UUID" \
node scripts/sync-board-to-supabase.mjs
```

This is idempotent for `tickets` (upsert by `id`) and avoids duplicating the same initial sync event note.

## Notes
- This V1 uses status selector (not drag/drop) to keep implementation fast.
- Realtime depends on Supabase publication `supabase_realtime` including both kanban tables.

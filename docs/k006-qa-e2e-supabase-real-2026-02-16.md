# K-006 — QA manual E2E Supabase real (Kanban)

Date: 2026-02-16 UTC
Role: QA / Verifier

## Scope requested
1) Migración aplicada (kanban schema + realtime)
2) Sync `board.md` -> Supabase
3) Realtime verificable en UI de navegador

## Environment
- Repo: `/root/.openclaw/workspace/mealmap`
- Supabase URL from `mobile/.env.local`: `https://cxhpvtwxpgpflgqylgsi.supabase.co`
- Supabase key available locally: anon key only
- Service role key: not available in workspace
- Known owner UUID: not available in workspace

## Execution attempted
- Added helper runner: `scripts/qa-k006-e2e.mjs` (auth + sync + realtime probe).
- Attempted to create disposable auth user via `supabase.auth.signUp` for owner context.

## Observed blockers (real, reproducible)
1) **Auth sign-up blocked by rate-limit**
   - Error: `over_email_send_rate_limit` (HTTP 429)
   - Prevents obtaining authenticated `auth.uid()` needed by RLS policies.
2) **No service-role key present**
   - Cannot run official sync path (`scripts/sync-board-to-supabase.mjs`) which requires:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_OWNER_ID`
3) **Kanban web app requires owner context but has no embedded sign-in step**
   - Without valid authenticated owner/session or service role, `tickets` read/update is blocked by RLS.

## QA status for K-006
- **Status:** BLOCKED (not closable yet)
- **What is still missing to close:**
  1. One valid authenticated owner user (email/password + owner UUID)
  2. Service role key _or_ explicit authenticated browser sign-in flow in `kanban-web`
  3. Successful end-to-end proof: migration + sync + realtime reflected in browser UI

## Fast unblock path
1) Provide secure env vars to shell for one run:
```bash
export SUPABASE_URL="https://cxhpvtwxpgpflgqylgsi.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role>"
export SUPABASE_OWNER_ID="<auth-user-uuid>"
```
2) Run:
```bash
node scripts/sync-board-to-supabase.mjs
```
3) Launch `kanban-web`, load board, move ticket in tab A, verify realtime in tab B.
4) Capture evidence (ticket row update + ticket_events row + browser screenshot) and then close K-006.

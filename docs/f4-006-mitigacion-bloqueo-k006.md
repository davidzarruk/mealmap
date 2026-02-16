# F4-006 — Mitigación operativa de bloqueo K-006

**completed_at:** 2026-02-16 12:35 UTC
**Rol:** Backend/QA

## Root Cause Analysis

K-006 (QA E2E con Supabase real) está bloqueado por **dos causas raíz**:

### 1. Kanban migration NOT APPLIED to Supabase project
- Both `tickets` and `ticket_events` tables return **404 (PGRST205)** from the REST API.
- The migration file `20260216092000_kanban_live.sql` exists but was never executed against the live Supabase instance.
- **This is the primary blocker**, not a code issue.

### 2. Auth rate-limit on sign-up
- `over_email_send_rate_limit` when creating new QA users via `signUp()`.
- Supabase free tier enforces strict email send limits.

## Mitigations Delivered

### A. Preflight diagnostic script
- **`scripts/preflight-kanban-supabase.mjs`** — checks table accessibility + auth sign-in viability in one command.
- Usage: `cd mealmap && node scripts/preflight-kanban-supabase.mjs`
- With auth: `node scripts/preflight-kanban-supabase.mjs --email user@x.com --password pass`

### B. QA script updated to prefer sign-in
- **`scripts/qa-k006-e2e.mjs`** now accepts `QA_EMAIL` + `QA_PASSWORD` env vars.
- When set, uses `signInWithPassword` (no email send → no rate limit).
- Falls back to sign-up only when env vars are absent.

### C. Kanban-web auth flow added
- **`kanban-web/app.js`** now prompts for email/password and calls `signInWithPassword`.
- Persists session across reloads via Supabase client session management.
- Falls back to manual owner_id prompt if auth fails.

## Steps to Unblock K-006

The project owner needs to:

1. **Apply the kanban migration** — Go to Supabase Dashboard → SQL Editor → paste contents of `supabase/migrations/20260216092000_kanban_live.sql` → Run.
2. **Create a QA user** (if none exists) — Dashboard → Authentication → Add User.
3. **Run preflight** to verify: `node scripts/preflight-kanban-supabase.mjs --email <email> --password <pass>`
4. **Run E2E QA**: `QA_EMAIL=<email> QA_PASSWORD=<pass> node scripts/qa-k006-e2e.mjs`
5. **Close K-006** when all checks pass.

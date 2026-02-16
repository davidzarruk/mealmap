# T-OPS-03 Logging + Basic Health Checks

## Logging baseline
Capture structured logs for core user flows:

- `auth_sign_in_attempt`, `auth_sign_in_success`, `auth_sign_in_error`
- `plan_create_started`, `plan_create_completed`
- `meal_swap_requested`, `meal_swap_completed`
- `shopping_list_generated`

## Required fields
- `timestamp`
- `env` (`dev|staging`)
- `user_id` (if available)
- `plan_id` (if available)
- `duration_ms`
- `status` (`ok|error`)
- `error_code` (nullable)

## Health checks (basic)
1. **App config check**: required env vars present at boot.
2. **Supabase connectivity check**: lightweight read on app launch/session restore.
3. **Auth session check**: detect invalid session and force re-auth path.
4. **Plan persistence check**: verify read/write roundtrip during QA smoke.

## Alert thresholds (MVP)
- p95 critical action duration > 2500ms for 15 minutes.
- auth error rate > 5% over 10-minute window.
- connectivity check failures 3 consecutive attempts.

## QA smoke script checklist
- [ ] Login works with valid credentials
- [ ] Plan generation loads
- [ ] Swipe replace returns alternatives
- [ ] Shopping list totals appear
- [ ] Logs contain expected events

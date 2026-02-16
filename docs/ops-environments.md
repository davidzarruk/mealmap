# T-OPS-01 Environments (dev/staging)

## Targets
Mealmap uses two runtime environments for MVP hardening:

- **dev**: local/feature validation
- **staging**: pre-release validation with production-like settings

## Environment matrix

| Item | dev | staging |
|---|---|---|
| Supabase project | `mealmap-dev` | `mealmap-staging` |
| Mobile app config | `.env.local` | `.env.staging` |
| Data persistence | disposable/resettable | stable for QA cycles |
| Logging level | debug/info | info/warn |
| Feature flags | permissive | release-like |

## Required variables
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_APP_ENV` (`dev` or `staging`)
- `EXPO_PUBLIC_ENABLE_VERBOSE_LOGS` (`true/false`)

## Conventions
- Never point staging app to dev database.
- Do not share anon keys through chat; use secret manager (see T-OPS-02).
- Schema migrations are applied in dev first, then staging after smoke checks.

## Release gate
Promote dev -> staging only if:
- unit/integration tests pass,
- replacement + consolidation smoke tests pass,
- no blocking auth errors in logs.

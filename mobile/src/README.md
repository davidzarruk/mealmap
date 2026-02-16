# Mobile app structure (MVP)

- `navigation/`: Root stack, auth stack, main tabs
- `screens/`: grouped by domain (`auth`, `setup`, `plan`, `shopping`, `profile`)
- `components/`: reusable UI primitives (`ScreenContainer`)
- `theme/`: design tokens (colors)
- `types/`: shared TS types (navigation params)
- `lib/supabase.ts`: Supabase client for Expo/React Native (AsyncStorage persistence)
- `config/env.ts`: required runtime env vars guard

Current navigation base:
1. `RootNavigator` switches Auth/App by real Supabase session state.
2. `AuthNavigator` handles SignIn/SignUp.
3. `AppNavigator` wraps tabs + setup + meal details.
4. `MainTabsNavigator` exposes Plan, Shopping, Profile.

## Required local env vars

Create `mobile/.env.local` (already gitignored) with:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Use `.env.example` as template.

Validation commands (from `mobile/`):

- `npm run validate:env`
- `npm run smoke:supabase`

Detailed step-by-step: `../docs/supabase-env-checklist.md`.

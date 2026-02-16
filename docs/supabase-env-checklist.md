# Supabase env wiring checklist (N-001 local unblock)

Use this checklist to wire Supabase vars locally and verify they are ready for smoke validation.

## 1) Create Supabase project (external)
1. Open Supabase dashboard.
2. Create a new project for Mealmap MVP.
3. Wait until project status is `Healthy`.

## 2) Copy required public values
From **Project Settings → API** copy:
- `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
- `anon public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 3) Apply env vars in app
In `mealmap/mobile/.env.local` set:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

## 4) Local validation (exact commands)
Run from `mealmap/mobile`:

```bash
npm run validate:env
```

Expected output:
- `✅ EXPO_PUBLIC_SUPABASE_URL loaded`
- `✅ EXPO_PUBLIC_SUPABASE_ANON_KEY loaded`

## 5) Unblock migration smoke validation (N-002)
After env validation passes, run:

```bash
npm run smoke:supabase
```

Expected output:
- `✅ Supabase reachable`
- `✅ auth.getSession ok`
- `✅ profiles table reachable`

If it fails with network/auth errors, keep N-002 blocked and attach command output to board notes.

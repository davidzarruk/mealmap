# T-RVW-02 Security Pass (Auth + Session)

Completed at: 2026-02-16 UTC

## Scope
- `mobile/src/screens/auth/SignInScreen.tsx`
- `mobile/src/screens/auth/SignUpScreen.tsx`
- `mobile/src/screens/profile/ProfileScreen.tsx`

## Changes applied
1. Email normalization before auth calls (`trim + lowercase`).
2. Client-side auth guard:
   - Valid email format required.
   - Minimum password length: 8.
   - Disabled submit when invalid/loading.
3. Safer platform autofill hints:
   - `autoComplete` and `textContentType` for email/password fields.
4. Friendlier auth error messaging for invalid credentials/network issues.
5. Global sign out from profile to invalidate all active sessions.

## Result
- Reduced accidental weak-input auth attempts.
- Better session invalidation behavior for shared/stolen-device scenarios.
- Improved user guidance in auth failure states.

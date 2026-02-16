# T-OPS-02 Secret Management

## Scope
Manage Supabase keys and runtime secrets safely for dev/staging.

## Secret classes
1. **Public client config**
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Can be embedded client-side, but still handled carefully.
2. **Server/admin secrets (never client-side)**
   - Supabase service role key
   - Any provider API keys (future LLM providers)

## Rules
- `.env.local` is local-only and gitignored.
- `.env.example` contains placeholders only.
- Never commit real keys to repo history.
- Rotate exposed keys immediately.

## Handling workflow
1. Generate/store keys in platform secret vault.
2. Inject to local env files manually or via secure CI variables.
3. Validate app startup with non-production account.
4. Rotate quarterly or on any suspected leak.

## Incident response (key leak)
1. Revoke leaked key.
2. Issue replacement key.
3. Update secret vault and deployment env.
4. Verify auth + DB access paths.
5. Record incident note in ops log.

## Minimum checks before merge
- [ ] No hardcoded keys in source
- [ ] `.env*` files with real values excluded from git
- [ ] Docs updated when variable names change

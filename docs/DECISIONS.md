# Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-16 | Claude model is read from `ANTHROPIC_MODEL` in `apps/api/.env` (default `claude-sonnet-5-5`); no model id is hard-coded. | Swap models without code changes. |
| 2026-10-16 | Supabase project `wxekjnzgghlyxxvncadl` uses new-format keys: `sb_publishable_...` in `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `sb_secret_...` in `SUPABASE_SERVICE_ROLE_KEY`. | Keeps the variable names the agents use; the new keys are drop-in replacements. |
| 2026-10-16 | Next.js is pinned to 15 (`apps/web`), matching the agent files. | Agents' instructions are written for Next 15 APIs. |
| 2026-10-16 | Dev machine is Windows. Python venv binaries are in `apps/api/.venv/Scripts/`, not `.venv/bin/`. | Agent snippets use POSIX paths; translate them. |
| 2026-10-16 | Supabase project `wxekjnzgghlyxxvncadl` uses asymmetric JWT signing keys (JWKS returned one ES256 key, kid `8b7a271e-a6d0-47d6-a659-6e409e38fe28`). `apps/api/app/auth.py` must verify access tokens against `https://wxekjnzgghlyxxvncadl.supabase.co/auth/v1/.well-known/jwks.json` (ES256/RS256 via PyJWT `PyJWKClient`); `SUPABASE_JWT_SECRET` is not needed and must not be used. | Setup check on 2026-10-16: the `keys` array at the JWKS endpoint was non-empty, so the project is not on the legacy HS256 shared secret. |

## Open questions
- (none yet)

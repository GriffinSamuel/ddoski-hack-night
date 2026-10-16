# Hackathon project

## Stack
Next.js 15 App Router (`apps/web/`, Vercel) · FastAPI + Pydantic v2 (`apps/api/`) · Supabase for Postgres, Auth, Realtime (`supabase/migrations/`) · Claude API, called only from the backend.

## Shared state (no agent messaging exists; files are the only channel)
- `docs/VALIDATION.md` go/no-go (project-idea-validator)
- `docs/SPEC.md` MVP scope, features, acceptance criteria, demo script (product-manager). Source of truth.
- `docs/DESIGN.md` tokens, components, wireframes (ui-designer)
- `docs/API.md` OpenAPI contract (api-designer). Frontend and backend build against this; only api-designer edits it.
- `docs/DECISIONS.md` append-only log: decision, why, date. Plus an "Open questions" section any agent may append to.
- `docs/REVIEW.md` latest surgeon-reviewer verdict
- `docs/TEST_REPORT.md` latest test-automator run (pass/fail per suite, failing test names, suspected files)
- `docs/PITCH.md` headline and pitch (landing-page-copywriter)

## Ownership (parallel agents must not cross these lines)
- nextjs-developer → `apps/web/**` except `apps/web/lib/supabase/`, `apps/web/middleware.ts`, `apps/web/app/(auth)/**`
- fastapi-developer → `apps/api/**` except `apps/api/app/auth.py` and `apps/api/app/prompts/`
- auth-integration-engineer → the excluded paths above, plus `supabase/migrations/0002_auth.sql` (never edits `0001_init.sql`)
- api-designer → `docs/API.md`, `apps/api/app/schemas.py`, `apps/web/lib/api-types.ts`, `supabase/migrations/0001_init.sql`
- prompt-engineer → `apps/api/app/prompts/`, `apps/api/tests/evals/`, and only the tool schema / system / temperature / max_tokens lines inside `apps/api/app/services/claude.py`
- test-automator → `apps/api/tests/` (except `evals/`), `apps/web/e2e/`, `apps/web/playwright.config.ts`, `docs/TEST_REPORT.md`
- debugger → any file, smallest possible change, must name every file it touched outside the failing agent's paths

## Pipeline
1. Scope (sequential, once): project-idea-validator → product-manager → ui-designer
2. Contract (once): api-designer
3. Build (parallel): nextjs-developer ∥ fastapi-developer ∥ auth-integration-engineer, then prompt-engineer
4. Verify (parallel): test-automator ∥ surgeon-reviewer → debugger for each failure
5. Ship (parallel): readme-generator ∥ landing-page-copywriter

The main session is the orchestrator. Every delegation message names the input files, the output files expected back, and ends with: reply in the STATUS/WROTE/VERIFIED/ASSUMPTIONS/OPEN QUESTIONS/NEXT format. `docs/AGENT_BRIEF.md` is the authoring reference for these agent files; edit an agent file directly if its behavior needs to change. Spawn phase-3 agents with `isolation: worktree` if they ever need to touch overlapping paths.

## Env vars
See `.env.example`. Test-only: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `BASE_URL`. Backend pins are recorded by `pip freeze > apps/api/requirements.lock`, never hand-typed.

## Rules
- Secrets only in `.env` (gitignored) and documented in `.env.example`. Nothing secret in `NEXT_PUBLIC_*`.
- Every Supabase table gets RLS enabled and a policy before any code reads it.
- Simplest thing that demos. No feature not in `docs/SPEC.md`.

## This machine and template (read before running commands)
- Dev machine is Windows. The backend venv is `apps/api/.venv`; its binaries are in `.venv/Scripts/` (for example `apps/api/.venv/Scripts/python.exe`, `.venv/Scripts/uvicorn.exe`). Agent snippets that say `python3.12 -m venv`, `. .venv/bin/activate`, or `.venv/bin/...` mean the Windows equivalents. Do not recreate the venv if it exists.
- The template is pre-scaffolded to the agents' conventions: `apps/web` is Next.js 15 with `@supabase/ssr`, `@supabase/supabase-js` and `@playwright/test` installed; `apps/api` has `app/config.py`, `app/main.py` (`create_app`, error envelope, CORS) and `app/routers/health.py` (`GET /api/v1/health`) with a passing test. Builders extend these; they do not re-scaffold.
- Env values are already filled in `apps/api/.env` (Supabase URL and secret key) and `apps/web/.env.local` (Supabase URL and publishable key). Never print, copy, or commit these values. `ANTHROPIC_API_KEY` is empty until the human adds it; if an AI feature needs it, say so in OPEN QUESTIONS instead of failing silently.
- Run the backend: `cd apps/api && .venv/Scripts/uvicorn.exe app.main:app --reload --port 8000`. Run the frontend: `cd apps/web && npm run dev`.
- Checks: backend `cd apps/api && .venv/Scripts/python.exe -m pytest -q`; frontend `cd apps/web && npm run build && npm run lint`.

## Slash commands (orchestrator shortcuts for the pipeline)
- `/kickoff <idea>`: phases 1 and 2, pausing for the human after validation and after the contract.
- `/build`: phase 3.
- `/verify`: phase 4.
- `/ship`: phase 5.
Commit after each phase with a one-line message naming the phase.

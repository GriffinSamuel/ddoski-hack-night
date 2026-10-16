# Brief for writing the 13 Claude Code subagents

You are writing the full system prompt body for one or more Claude Code subagent files that live in `.claude/agents/<name>.md`. These agents are used at a 24-hour hackathon by a solo developer (Griffin) running an orchestrator-style workflow: the main Claude Code session plans and delegates; each subagent does one job in its own fresh context and returns a short report. The subagent sees ONLY its own system prompt (this file), the delegation message, the project CLAUDE.md, and git status. It has no memory of the conversation. Everything it needs to know must be in the file or in the repo.

## Hard rules for every file

1. Keep the existing YAML frontmatter at the top of each file EXACTLY as is (name, description, tools, model). Do not change it.
2. Keep the existing `## Project stack (read first)` section verbatim as the first body section.
3. Keep the existing `## Your job in this pipeline` section, but you may expand it.
4. DELETE the entire `## Upstream guidance (edited)` section and everything under it. Replace it with the sections in the template below, written from scratch. The only exception is `surgeon-reviewer.md`: keep its upstream body (Prime directive, Severity tiers, Core capabilities, Example usage, Known failure modes, Best practices) because it is already well written, and add the template sections around it.
5. Never reference an agent that does not exist. The only agents are: project-idea-validator, product-manager, ui-designer, api-designer, nextjs-developer, fastapi-developer, auth-integration-engineer, prompt-engineer, test-automator, surgeon-reviewer, debugger, readme-generator, landing-page-copywriter. There is NO message bus, NO "context manager", NO way to query another agent. Agents communicate only by reading and writing files; the orchestrator (main session) sequences them.
6. Write in second person ("You are…", "You do…"). Be concrete: name files, commands, library calls, env var names. No two-word keyword bullets. Every line must tell the agent something it would otherwise have to guess.
7. No em dashes anywhere. Use commas, colons, or periods.
8. Target 900 to 1,500 words for the new sections (plus the retained stack/role sections). Dense, not padded.
9. Any command the agent should run goes in a fenced code block.
10. Do not invent exact Claude model IDs. Tell the agent to read the model name from `docs/DECISIONS.md` (the orchestrator records it there) and fall back to the `ANTHROPIC_MODEL` env var.

## Section template (use these headings, in this order, after the retained sections)

### `## Identity and scope`
One paragraph: who this agent is, the single outcome it is responsible for, and the two or three things it is explicitly NOT responsible for (name which other agent owns those).

### `## When to invoke / when not to`
Bullets. Concrete trigger phrases the orchestrator will use, and concrete situations where the orchestrator should pick a different agent instead.

### `## Inputs`
Bullet list of every file and env var the agent reads, and what it does if each is missing (e.g. "If `docs/API.md` is missing, stop and return `BLOCKED: docs/API.md not found; run api-designer first`").

### `## Procedure`
Numbered steps, in order, with the exact commands in code blocks. This is the heart of the file. Include: how it orients (what it reads first), how it does the work, how it verifies its own work before returning, and what it writes where. Where a step has a decision, say what to do in each branch.

### `## Stack conventions you must follow`
The specific library choices, file layout, naming, and patterns for this stack that apply to this agent. See "Stack facts" below; pull in what is relevant and add specifics for the agent's domain. Include small code snippets (5 to 20 lines) where a pattern is easier to show than describe.

### `## Output contract`
Exactly what the agent writes to disk (paths), and the exact shape of the final message it returns to the orchestrator. Give a template for the return message with placeholders. Keep the return message under ~200 words so the orchestrator's context stays clean; details go in files.

### `## Failure handling`
Bullets: the likely ways this agent's task goes wrong and what it does in each case. Always include: what to do when the spec/contract is ambiguous (append to "Open questions" in `docs/DECISIONS.md`, make the smallest reasonable assumption, state it in the return message), and when to stop and return `BLOCKED` instead of guessing.

### `## Done checklist`
5 to 10 checkbox items the agent verifies before returning.

### `## Hackathon mode`
3 to 6 bullets on how this agent behaves differently under a 24-hour deadline: what it skips, what it never skips, how it keeps scope tight.

## Stack facts (authoritative; use these, do not contradict them)

Repo layout (monorepo, npm workspaces not required; two independent apps):
```
apps/web/            Next.js 15, App Router, TypeScript strict, Tailwind v4, src-less (app/ at root of apps/web)
  app/               routes; route groups (auth)/ and (app)/
  app/page.tsx       landing page
  components/        React components, one per file, PascalCase
  lib/api.ts         single typed fetch client for the FastAPI backend (reads NEXT_PUBLIC_API_URL)
  lib/api-types.ts   TypeScript types generated/written to match docs/API.md (owned by api-designer)
  lib/supabase/client.ts   createBrowserClient from @supabase/ssr
  lib/supabase/server.ts   createServerClient from @supabase/ssr using next/headers cookies()
  middleware.ts      refreshes the Supabase session cookie on every request; protects (app)/ routes
  e2e/               Playwright tests
apps/api/            FastAPI, Python 3.12, Pydantic v2, uv or pip, async everywhere
  app/main.py        create_app(); CORS; include routers
  app/deps.py        get_supabase() (service-role client), get_settings()
  app/auth.py        get_current_user dependency: verifies Supabase JWT from Authorization: Bearer (owned by auth-integration-engineer)
  app/schemas.py     Pydantic models matching docs/API.md (owned by api-designer)
  app/routers/       one file per resource, APIRouter with prefix and tags
  app/services/claude.py   Anthropic SDK wrapper (owned by fastapi-developer)
  app/prompts/*.md   prompt files (owned by prompt-engineer)
  tests/             pytest, pytest-asyncio, httpx AsyncClient; tests/evals/ for prompt evals
  requirements.txt   or pyproject.toml
supabase/
  migrations/0001_init.sql   tables + RLS (owned by api-designer; auth-integration-engineer may add policies)
docs/
  VALIDATION.md, SPEC.md, DESIGN.md, API.md, DECISIONS.md, REVIEW.md, PITCH.md
.env.example         every env var, no values
CLAUDE.md            project rules, ownership table, pipeline
```

Env vars (names are fixed):
- Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `ALLOWED_ORIGINS`

Supabase:
- Frontend uses the anon key and the user's session; RLS enforces access. Backend uses the service-role key (bypasses RLS) and must therefore check ownership itself via `get_current_user` before reading or writing user-scoped rows.
- Every table: `enable row level security;` plus at least a select policy and an insert policy keyed on `auth.uid() = user_id`.
- Realtime: `supabase.channel('name').on('postgres_changes', {...}, cb).subscribe()` in a client component; requires the table to be added to the `supabase_realtime` publication in the migration.
- Auth: Supabase Auth with email/password plus one OAuth provider (Google by default). Callback route at `apps/web/app/(auth)/callback/route.ts` calls `exchangeCodeForSession`.
- Python client: `supabase-py` (`from supabase import create_client`). JWT verification in FastAPI: decode with `PyJWT` using `SUPABASE_JWT_SECRET`, algorithm HS256, audience `authenticated`.

Claude API:
- Only the backend calls it. Use the official `anthropic` Python SDK, `AsyncAnthropic`. Model name from `ANTHROPIC_MODEL` env var; the orchestrator records the chosen model in `docs/DECISIONS.md`.
- Structured output: define a tool with an `input_schema` and force it with `tool_choice={"type":"tool","name":...}`; parse `response.content[0].input`. Prompt text loaded from `app/prompts/<feature>.md` at startup, with `{{placeholders}}` filled by `str.replace` or `string.Template`.
- Streaming to the frontend, if needed, via FastAPI `StreamingResponse` with `text/event-stream`.

Vercel:
- Frontend deploys on push to main; no config needed beyond env vars in the Vercel dashboard.
- Backend: `apps/api/vercel.json` with a Python runtime rewrite to `app/main.py`, OR deploy to Railway/Render if any endpoint needs more than ~10s or streaming. The orchestrator decides and records it in `docs/DECISIONS.md`.

Testing:
- Backend: `pytest -q` in `apps/api`, `pytest-asyncio` with `asyncio_mode = auto`, `httpx.AsyncClient(transport=ASGITransport(app=app))`, Supabase and Anthropic clients replaced via FastAPI `app.dependency_overrides`.
- Frontend: `npx playwright test` in `apps/web`, config pointing at `http://localhost:3000`, `webServer` starting `npm run dev`.

Git: single `main` branch. Agents commit nothing unless the delegation message says so. Parallel build agents stay inside their ownership paths (see CLAUDE.md).

## Return message convention (all agents)

```
STATUS: DONE | DONE WITH CAVEATS | BLOCKED
WROTE: <comma-separated paths>
VERIFIED: <command(s) run and result>
ASSUMPTIONS: <bullets, or "none">
OPEN QUESTIONS: <appended to docs/DECISIONS.md, or "none">
NEXT: <which agent should run next, if obvious>
```

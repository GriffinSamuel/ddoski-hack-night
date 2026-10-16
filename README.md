# Hackathon Starter

A template for building a hackathon project with a team of 13 Claude subagents, run by the main Claude Code session as the orchestrator. Copy this folder for each hackathon and never build inside the template itself.

**Stack:** Next.js 15 + Tailwind (`apps/web`), FastAPI + Pydantic v2 (`apps/api`), Supabase for database and login (`supabase/migrations`), Claude API called only from the backend, Vercel for hosting.

**How the agents work together:** agents never talk to each other. They read and write shared files in `docs/` (SPEC, DESIGN, API, DECISIONS, TEST_REPORT, REVIEW, PITCH), and each one owns specific folders so parallel agents never edit the same file. `CLAUDE.md` has the full ownership table.

---

## The pipeline

| Phase | Command | Agents | Runs |
|---|---|---|---|
| 1. Scope | `/kickoff <idea>` | project-idea-validator, then product-manager, then ui-designer | one after another, with a stop after validation for your go/no-go |
| 2. Contract | (same command) | api-designer | once |
| 3. Build | `/build` | nextjs-developer, fastapi-developer, auth-integration-engineer, then prompt-engineer if the app uses AI | first three in parallel |
| 4. Verify | `/verify` | test-automator, surgeon-reviewer, then debugger once per failure | first two in parallel |
| 5. Ship | `/ship` | readme-generator, landing-page-copywriter | in parallel |

**Using Figma:** add `| Figma: <link>` to `/kickoff` (or put the link in `docs/BRIEF.md`). The main session reads the design into `docs/FIGMA_NOTES.md` and ui-designer matches it exactly. Figma must be connected in your Claude Code session (check with `/mcp`).

If a slash command doesn't show up in your Claude app, open the matching file in `.claude/commands/` and paste its contents instead (replace `$ARGUMENTS` with your idea).

---

## Setup for a new hackathon (about 10 minutes)

1. Copy the `hackathon-starter` folder and rename the copy for the event.
2. Open the copy in Claude Code and have it run setup from the repo root:
   ```
   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
   ```
3. Start both servers and open http://localhost:3000. The status page should show the backend reachable and Supabase keys ready:
   ```
   powershell -ExecutionPolicy Bypass -File scripts\dev.ps1
   ```
4. Make it a git repo:
   ```
   git init; git add .; git commit -m "Starter kit"
   ```

Env values live in `apps/api/.env` (backend secrets) and `apps/web/.env.local` (frontend). Both are gitignored. The Supabase keys are already filled in; add `ANTHROPIC_API_KEY` to `apps/api/.env` only if the app uses AI.

---

## Folder layout
```
CLAUDE.md                    project rules, ownership table, pipeline (every agent reads it)
.claude/agents/              the 13 subagents
.claude/commands/            /kickoff /build /verify /ship
docs/AGENT_BRIEF.md          how the agent files were written (edit agents directly to change behavior)
docs/DECISIONS.md            append-only decision log plus open questions
apps/api/app/main.py         FastAPI app factory, CORS, error envelope
apps/api/app/config.py       settings read from apps/api/.env
apps/api/app/routers/        one router per resource (health.py is the starter)
apps/web/app/                Next.js pages (page.tsx is a starter status page)
supabase/migrations/         SQL schema and RLS policies
scripts/                     setup and dev helpers (PowerShell and bash)
```

## Deploying
- **Frontend:** import the repo in Vercel, set Root Directory to `apps/web`, and add the `NEXT_PUBLIC_*` variables.
- **Backend:** fastapi-developer writes the deploy config for the target recorded in `docs/DECISIONS.md` (a Vercel Python function by default, Railway or Render if any endpoint streams). Add the backend variables from `.env.example` and set `ALLOWED_ORIGINS` to the Vercel URL.
- Deploy early, within the first few hours, so the final hour isn't a deploy fire.

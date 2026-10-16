---
description: Pipeline phase 3. Runs the builders in parallel, then prompt-engineer if the app uses AI.
---
Run phase 3 of the pipeline in CLAUDE.md.

1. Confirm docs/SPEC.md, docs/DESIGN.md and docs/API.md exist. If one is missing, stop and tell me which phase to rerun.
2. In a single message, delegate in parallel to nextjs-developer, fastapi-developer, and auth-integration-engineer. Skip auth-integration-engineer only if docs/SPEC.md has no login or per-user data. Each delegation names its owned paths from the CLAUDE.md ownership table, its input files, and the return format.
3. When all three return, read their reports. If the SPEC has an AI feature, delegate to prompt-engineer. If ANTHROPIC_API_KEY is empty in apps/api/.env, tell me first so I can add it, and let prompt-engineer write prompts without running live evals.
4. Run the checks from CLAUDE.md (backend pytest, frontend build and lint), start both servers, and confirm the frontend loads and calls the backend.
5. Report in a few lines: what works on the demo path, every STUB still in place, and every OPEN QUESTION. Commit with "Phase 3: build" and tell me to run /verify.

# Face-Roast Editor

**Live demo:** https://ddoski-hack-night.vercel.app (frontend only: roasts come from the built-in roast bank; run locally with Ollama for AI-generated roasts) · **Source:** https://github.com/GriffinSamuel/ddoski-hack-night

A webcam reads your mood and a meme avatar punishes your code: sad gets roasted, too happy gets deleted.

A VS Code-style editor in the browser (Monaco, dark theme, tabs, status bar). It is not a real VS Code extension.

## What it does

- **Sad face:** the avatar dances and pulls mean faces, and a 2-line insult is inserted above your cursor line (pure mockery, never advice). At most 3 roasts live in a file; a 4th evicts the oldest, and no line is ever repeated in a session. Your code is never modified.
- **Happy face:** smile and a 4.5-second unskippable overlay plays, the whole file is replaced by a mocking comment and ASCII art, and the avatar laughs at you. "Undo roast", Ctrl+Z or "Reset" brings the code back.
- **Three avatars:** Labubu, CalHacks Bear, Rubber Duck. Each has its own voice, so the same code gets roasted differently.
- **Profane or clean:** mild cursing by default, one hotkey to flip to a clean version of the same jokes.
- **Private:** the emotion model runs in the browser. Webcam frames never leave it.
- **Works offline:** a pre-written roast bank lives in the frontend, so roasts work with the backend off and Ollama not running. If a local Ollama model is up, roasts name real variables and functions from your file.
- **Safe:** edits touch only in-memory editor buffers. Nothing is written to disk, and reload resets both files.

## Run it locally (about 60 seconds)

Prerequisites: Node 20+, Python 3.11, and [Ollama](https://ollama.com) running with the model pulled (optional: without it the app uses the roast bank).

```text
ollama pull qwen2.5-coder:7b
```

1. From the repo root, run setup once (creates `apps/api/.venv`, installs npm and pip packages):

   ```text
   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
   ```

2. Start the backend. The first start waits about 50 s for the model warm-up when Ollama is cold:

   ```text
   cd apps/api && .venv/Scripts/uvicorn.exe app.main:app --reload --port 8000
   ```

3. In a second terminal, start the frontend:

   ```text
   cd apps/web && npm run dev
   ```

4. Open http://localhost:3000 and allow the camera. Use desktop Chrome.

If the camera is denied, the status bar reads "Camera unavailable - manual mode" and the hotkeys below still drive everything.

## Demo hotkeys

Hidden in the UI, captured at window level, so they work with the editor focused. Forced emotions skip the 1.5 s hold and the cooldown.

| Key | Action |
|-----|--------|
| Alt+1 | Force neutral |
| Alt+2 | Force sad |
| Alt+3 | Force happy (delete + mock) |
| Alt+4 | Same as Alt+3 |
| Alt+0 | Pause or resume camera detection |
| Alt+P | Toggle roast mode, profane or clean (status bar shows "Mode: ...") |
| Undo roast button / Ctrl+Z | Restore the code from before the last edit |

With the camera, hold a sad face for about 0.6 s or a smile for 1.5 s. After an edit there is a 6 s cooldown.

## Architecture

```text
 Browser (Next.js, desktop Chrome)                  Your laptop
+------------------------------------------+
| Webcam -> face-expression model (local)  |
|              |                           |
|        emotion + hold timer              |       +-------------------+
|              |                           | POST  |  FastAPI :8000    |      +-----------------------+
|   Monaco editor <- roast bank (offline) -+------>|  /api/v1/roast    |----->| Ollama                |
|   avatar panel, status bar               |<------+  (7 s client cap) |<-----| qwen2.5-coder:7b      |
+------------------------------------------+ JSON  +-------------------+      +-----------------------+
        on any error or timeout: use the roast bank, status bar shows "AI offline - using roast bank"
```

## API

Full contract in [docs/API.md](docs/API.md). Interactive docs at http://localhost:8000/docs while the backend runs.

- `GET /api/v1/health` returns `status` and `ai_configured` (true once the Ollama warm-up succeeded).
- `POST /api/v1/roast` takes `code`, `emotion` (sad, happy, super-happy), `avatar`, `mode` (profane, clean) and optional `file_name`. It returns 2 comment lines (sad; the app no longer sends happy) or a mocking comment block plus ASCII art (super-happy, which the app uses for any smile). Errors are `ai_unavailable` 503, `ai_error` 502, `ai_timeout` 504, and the client falls back to the bank on any of them.

## Environment variables

Names are in `.env.example`. Backend values go in `apps/api/.env`, frontend values in `apps/web/.env.local`; both are gitignored. The defaults work for the demo.

| Name | Used by | Purpose |
|------|---------|---------|
| `OLLAMA_BASE_URL` | api | Optional. Ollama address. Default `http://localhost:11434`. |
| `OLLAMA_MODEL` | api | Optional. Model used for roasts. Default `qwen2.5-coder:7b`. |
| `ALLOWED_ORIGINS` | api | CORS origins. `http://localhost:3000` in `.env.example`. |
| `NEXT_PUBLIC_API_URL` | web | Backend address the web app calls (local: `http://localhost:8000`). |
| `NEXT_PUBLIC_SITE_URL` | web | Site URL (local: `http://localhost:3000`). |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` | web, api | Unused by this MVP (no login, no database). |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | api | Unused by this MVP (the AI is local Ollama). |
| `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `BASE_URL` | tests | Test-only. |

## Content rule

Two modes, both bounded. Profane allows mild cursing ("dumbass", "damn", "shit code") aimed only at the code and the user's coding skill. Clean has no cursing. In both modes: no slurs, nothing about race, gender, sexuality, religion, disability, nationality, or any protected group, no threats, no self-harm references, and nothing about the user's appearance. This applies to the roast bank and the AI prompt, and the backend drops model output that breaks it.

## Built with

- Next.js 15 (App Router), TypeScript, Tailwind v4
- Monaco editor (`@monaco-editor/react`)
- `@vladmandic/face-api` for in-browser expression detection
- FastAPI, Pydantic v2, httpx
- Ollama running `qwen2.5-coder:7b` locally

## Known limitations

- Desktop Chrome only. No mobile layout, no light theme.
- Detection is sensitive to lighting. Dim rooms and projector glare can misread a face, which is why the hotkeys and the live meter exist.
- A 7B local model gives uneven roast quality. When it is slow or wrong, the bank takes over.
- Python is the only editor language, and the two files are seeded (`bad_code.py`, `good_code.py`).
- Avatar images are idle-state only. Missing images fall back to emoji faces.

## Docs

[docs/SPEC.md](docs/SPEC.md) (scope and demo script) · [docs/API.md](docs/API.md) (contract) · [docs/DECISIONS.md](docs/DECISIONS.md) (decision log)

Team: solo, built with an agent pipeline for a hackathon.

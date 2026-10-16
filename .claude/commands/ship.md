---
description: Pipeline phase 5. Feature freeze, README and pitch in parallel, deploy checklist.
---
Feature freeze. Run phase 5 of the pipeline in CLAUDE.md. No new features from here on.

1. Ask me for the live URLs (Vercel frontend, backend host) if I have deployed. If not, give me the deploy checklist first: Vercel project with root directory apps/web and the NEXT_PUBLIC_* vars; backend on the target recorded in docs/DECISIONS.md with the backend vars from .env.example; ALLOWED_ORIGINS set to the Vercel URL.
2. In a single message, delegate in parallel to readme-generator and landing-page-copywriter, passing the live URLs if I gave them.
3. Run the frontend build and lint once more after the copywriter's edits to apps/web/app/page.tsx.
4. Give me the 90-second pitch from docs/PITCH.md, the README status, and a final checklist: demo path works on the live URL, no secrets in git (`git grep -E "sb_secret_[A-Za-z0-9_-]{20,}"` returns nothing), Devpost fields drafted. Commit with "Phase 5: ship".

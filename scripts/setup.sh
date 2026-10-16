#!/usr/bin/env bash
# One-time setup on macOS, Linux, or WSL. Run from the repo root: bash scripts/setup.sh
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/apps/api"
[ -d .venv ] || python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt
cd "$root/apps/web"
npm install
npx playwright install chromium
echo "Done. Start both servers with: bash scripts/dev.sh"

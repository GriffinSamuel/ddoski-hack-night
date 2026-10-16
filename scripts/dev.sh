#!/usr/bin/env bash
# Starts backend (port 8000) and frontend (port 3000) together. Ctrl+C stops both.
root="$(cd "$(dirname "$0")/.." && pwd)"
trap 'kill 0' EXIT
(cd "$root/apps/api" && .venv/bin/uvicorn app.main:app --reload --port 8000) &
(cd "$root/apps/web" && npm run dev) &
echo "Backend: http://localhost:8000/docs   Frontend: http://localhost:3000"
wait

# One-time setup on Windows (PowerShell). Run from the repo root:
#   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "== Backend (apps/api): Python virtual environment and packages =="
Set-Location "$root\apps\api"
if (-not (Test-Path ".venv")) { python -m venv .venv }
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt

Write-Host "== Frontend (apps/web): npm packages and Playwright browser =="
Set-Location "$root\apps\web"
npm install
npx playwright install chromium

Set-Location $root
Write-Host ""
Write-Host "Done. Start both servers with: powershell -ExecutionPolicy Bypass -File scripts\dev.ps1"

# Starts backend (port 8000) and frontend (port 3000) in two new windows. Run from the repo root:
#   powershell -ExecutionPolicy Bypass -File scripts\dev.ps1
$root = Split-Path -Parent $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\api'; .\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\web'; npm run dev"
Write-Host "Backend: http://localhost:8000/docs   Frontend: http://localhost:3000"

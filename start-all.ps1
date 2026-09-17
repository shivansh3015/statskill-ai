$ProjectRoot = "E:\statskill_ai"

$BackendPath = "$ProjectRoot\backend"
$FrontendPath = "$ProjectRoot\frontend"
$PythonPath = "$ProjectRoot\.venv\Scripts\python.exe"

Write-Host "Starting StatSkill AI..." -ForegroundColor Cyan


# ============================================================
# BACKEND
# ============================================================

Start-Process powershell `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$BackendPath'; & '$PythonPath' -m uvicorn main:app --host 127.0.0.1 --port 8000"
    )


Write-Host "Starting backend..." -ForegroundColor Yellow

Start-Sleep -Seconds 2


# ============================================================
# FRONTEND
# ============================================================

Start-Process powershell `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$FrontendPath'; npm start -- -p 4028"
    )


Write-Host "Starting frontend..." -ForegroundColor Yellow

Start-Sleep -Seconds 4


# ============================================================
# OPEN APPLICATION
# ============================================================

Write-Host ""
Write-Host "StatSkill AI is running." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://127.0.0.1:4028" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Swagger:  http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""

Start-Process "http://127.0.0.1:4028/dashboard"
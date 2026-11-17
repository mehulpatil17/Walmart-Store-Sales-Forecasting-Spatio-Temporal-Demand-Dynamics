@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo Launching Walmart ML Research Portal with Model (ES 335 - IITGN)
echo ======================================================================

:: 1. Detect Python executable
set "PY_CMD="
if exist "venv\Scripts\python.exe" (
    set "PY_CMD=venv\Scripts\python.exe"
    echo [OK] Using virtual environment Python: venv\Scripts\python.exe
) else (
    where python >nul 2>nul
    if !errorlevel! equ 0 (
        set "PY_CMD=python"
        echo [OK] Using system python from PATH
    ) else (
        where py >nul 2>nul
        if !errorlevel! equ 0 (
            set "PY_CMD=py -3"
            echo [OK] Using Windows Python Launcher (py -3)
        ) else if exist "C:\Users\MEHUL\AppData\Local\Python\bin\python.exe" (
            set "PY_CMD=C:\Users\MEHUL\AppData\Local\Python\bin\python.exe"
            echo [OK] Using local user Python binary
        )
    )
)

if "%PY_CMD%"=="" (
    echo [ERROR] Python not found. Please install Python 3.10+ or activate your venv.
    pause
    exit /b 1
)

:: 2. Launch XGBoost Model Server (Background on port 5001)
echo Starting XGBoost Model Server on http://127.0.0.1:5001 ...
start "XGBoost Model Server" /B %PY_CMD% model_server.py

:: 3. Launch Next.js Portal (Port 3000)
cd portal
if not exist "node_modules\" (
    echo [INFO] Installing portal npm dependencies...
    call npm install
)

echo Launching Next.js Research Portal on http://localhost:3000 ...
if exist ".next\" (
    call npm run start -- -p 3000
) else (
    call npm run dev -- -p 3000
)

pause

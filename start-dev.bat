@echo off
echo Starting TaskFlow Development Environment...
echo.

REM Check if Redis is installed
echo Checking Redis...
where redis-server >nul 2>nul
if %errorlevel% equ 0 (
    echo Redis found in PATH
) else (
    echo WARNING: Redis not found in PATH
    echo Please make sure Redis is installed and running
    echo Download from: https://github.com/tporadowski/redis/releases
    echo.
)

REM Start backend
echo Starting backend server...
cd server
start "TaskFlow Backend" npm run dev

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend application...
cd ..
start "TaskFlow Frontend" npm run dev

echo.
echo ============================================
echo TaskFlow Development Environment Started!
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:3000/api-docs
echo ============================================
echo.

REM Open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

pause

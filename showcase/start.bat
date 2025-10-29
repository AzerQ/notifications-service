@echo off
echo ╔════════════════════════════════════════════════╗
echo ║ Notification Service Showcase Application     ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Start backend
echo [1/2] Starting Backend API...
cd ..\backend
start "Backend API" cmd /k "dotnet run --project src\NotificationService.Api"
timeout /t 5 /nobreak > nul

REM Start frontend
echo [2/2] Starting Frontend...
cd ..\showcase\frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
start "Frontend" cmd /k "npm run dev"

echo.
echo ✓ Showcase application is starting!
echo.
echo Backend:  http://localhost:5093
echo Frontend: http://localhost:3000
echo.
echo Press any key to open frontend in browser...
pause > nul
start http://localhost:3000

echo.
echo To stop the application, close both terminal windows.
echo.
pause

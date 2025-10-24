@echo off
echo 🚀 Starting Notification Service Test Application
echo.
echo This script will:
echo 1. Start the backend API
echo 2. Start a simple HTTP server for the test app
echo.

REM Start backend
echo 📦 Starting backend API...
cd ..\backend
start "Notification Service API" dotnet run --project src\NotificationService.Api
timeout /t 5 /nobreak >nul
cd ..\testapp

REM Start HTTP server
echo.
echo 🌐 Starting HTTP server for test app...
start "Test App Server" python -m http.server 8080

echo.
echo 🎉 Test application is ready!
echo.
echo 📍 Test App URL: http://localhost:8080
echo 📍 Backend API: http://localhost:5000/api
echo 📍 SignalR Hub: http://localhost:5000/notificationHub
echo 📍 Swagger UI: http://localhost:5000/swagger
echo.
echo Press any key to stop all services...
pause >nul
taskkill /F /FI "WINDOWTITLE eq Notification Service API*"
taskkill /F /FI "WINDOWTITLE eq Test App Server*"

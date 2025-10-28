#!/bin/bash

echo "🚀 Starting Notification Service Test Application"
echo ""
echo "This script will:"
echo "1. Start the backend API"
echo "2. Start a simple HTTP server for the test app"
echo ""

# Check if backend is already running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend is already running on port 5000"
else
    echo "📦 Starting backend API..."
    cd ../backend
    dotnet run --project src/NotificationService.Api &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
    cd ../testapp
fi

# Wait for backend to start
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Start HTTP server
echo ""
echo "🌐 Starting HTTP server for test app..."
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8080 &
    SERVER_PID=$!
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    python -m SimpleHTTPServer 8080 &
    SERVER_PID=$!
else
    echo "❌ Python not found. Please install Python or use another HTTP server."
    exit 1
fi

echo "✅ HTTP server started (PID: $SERVER_PID)"
echo ""
echo "🎉 Test application is ready!"
echo ""
echo "📍 Test App URL: http://localhost:8080"
echo "📍 Backend API: http://localhost:5000/api"
echo "📍 SignalR Hub: http://localhost:5000/notificationHub"
echo "📍 Swagger UI: http://localhost:5000/swagger"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $SERVER_PID 2>/dev/null; exit" INT
wait

#!/bin/bash

# Showcase Application Startup Script

echo "🚀 Starting Notification Service Showcase Application"
echo "=================================================="
echo ""

# Check if backend is built
echo "📦 Checking backend..."
cd ../backend
if [ ! -d "src/NotificationService.Api/bin" ]; then
    echo "Building backend..."
    dotnet build
fi

# Start backend in background
echo "🔧 Starting backend API..."
cd src/NotificationService.Api
dotnet run &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID on http://localhost:5093"

# Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if frontend dependencies are installed
echo ""
echo "📦 Checking frontend..."
cd ../../../showcase/frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🎨 Starting frontend..."
npm run dev

# Cleanup on exit
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM

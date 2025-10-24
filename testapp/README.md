# Test Application for Notification Service

This is a simple test application that demonstrates the usage of the Notification Service with InApp notifications.

## Features

- Send test notifications (UserRegistered, OrderCreated, TaskAssigned)
- Real-time notifications via SignalR
- InApp notification component from the frontend

## Setup

1. Start the backend API:
   ```bash
   cd ../backend
   dotnet run --project src/NotificationService.Api
   ```

2. Open `index.html` in a web browser or use a simple HTTP server:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   ```

3. Open http://localhost:8080 in your browser

## Usage

The test application provides buttons to:
- Register a test user (sends UserRegistered notification)
- Create a test order (sends OrderCreated notification)
- Assign a test task (sends TaskAssigned notification)
- Send a broadcast test notification

All notifications will appear in real-time via SignalR connection.

## API Endpoints

The application connects to the notification service API at:
- API Base URL: http://localhost:5000/api
- SignalR Hub: http://localhost:5000/notificationHub

## Testing

1. Click any of the test buttons
2. Watch notifications appear in real-time
3. Check the notification history in the InApp component
4. Verify email delivery (if SMTP is configured)

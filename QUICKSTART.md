# 🚀 Quick Start Guide - Notification Service Showcase

Быстрый старт полнофункционального showcase приложения за 2 минуты!

## Prerequisites

- .NET 8 SDK ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- Node.js 18+ ([Download](https://nodejs.org/))

## One-Command Start

### Linux / macOS

```bash
cd showcase && ./start.sh
```

### Windows

```cmd
cd showcase
start.bat
```

## What You Get

После запуска откроется showcase приложение на **http://localhost:3000**

### Features Out of the Box

✅ **Authentication System**
- User registration with BCrypt password hashing
- JWT-based login
- Automatic session restoration

✅ **Real-Time Notifications**
- SignalR integration with JWT tokens
- **Targeted delivery** - notifications reach only specific users
- Automatic reconnection

✅ **Beautiful UI**
- Tailwind CSS with gradient backgrounds
- Responsive design for mobile and desktop
- Smooth animations

✅ **Test Notifications**
- UserRegistered - Welcome notification
- OrderCreated - Order confirmation  
- TaskAssigned - Task notification

## Your First Steps

### 1. Register a User

1. Navigate to http://localhost:3000
2. Click **"Sign up"**
3. Fill in the registration form
4. You'll be automatically logged in

### 2. Send a Test Notification

1. On the dashboard, select a notification type
2. Click **"Send Notification"**
3. See it appear instantly in the notification panel 🎉

### 3. Test Targeted Delivery

1. Open two different browsers (or incognito mode)
2. Register two different users
3. Send a notification from User A
4. **Only User A** receives the notification ✨

## Architecture Overview

```
showcase/
├── Backend (.NET 8)
│   ├── JWT Authentication
│   ├── SignalR Hub with UserIdProvider
│   ├── Targeted notification delivery
│   └── SQLite database
│
└── Frontend (React + TypeScript)
    ├── Vite build tool
    ├── MobX state management
    ├── Tailwind CSS styling
    └── SignalR client with JWT
```

## API Endpoints

Once running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5093/api
- **Swagger UI**: http://localhost:5093/swagger
- **SignalR Hub**: ws://localhost:5093/notificationHub

## Troubleshooting

### Port Already in Use

**Backend (5093):**
```bash
# Linux/Mac
lsof -i :5093 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :5093
taskkill /PID <PID> /F
```

**Frontend (3000):**
```bash
# Linux/Mac
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Backend Doesn't Build

```bash
cd backend
dotnet clean
dotnet restore
dotnet build
```

### Frontend Errors

```bash
cd showcase/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Manual Start (if scripts don't work)

### Terminal 1 - Backend

```bash
cd backend
dotnet run --project src/NotificationService.Api
```

Wait for: `Now listening on: http://localhost:5093`

### Terminal 2 - Frontend

```bash
cd showcase/frontend
npm install  # First time only
npm run dev
```

Wait for: `Local: http://localhost:3000`

## Next Steps

1. ✅ Try all notification types
2. ✅ Test targeted delivery with multiple users
3. ✅ Explore the code in `showcase/frontend/src`
4. ✅ Read full documentation in [showcase/README.md](showcase/README.md)
5. ✅ Check out [docs/08-Showcase-Application.md](docs/08-Showcase-Application.md)

## Key Code Locations

- **Authentication**: `backend/src/NotificationService.Api/Controllers/AuthController.cs`
- **SignalR Hub**: `backend/src/NotificationService.Api/Hubs/NotificationHub.cs`
- **User Provider**: `backend/src/NotificationService.Api/Providers/UserIdProvider.cs`
- **Frontend Auth**: `showcase/frontend/src/stores/AuthStore.ts`
- **Notifications**: `showcase/frontend/src/stores/NotificationStore.ts`
- **Dashboard**: `showcase/frontend/src/pages/DashboardPage.tsx`

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Backend Framework | .NET 8 |
| Authentication | JWT + BCrypt |
| Real-time | SignalR |
| Database | SQLite |
| Frontend Framework | React 18 |
| Language | TypeScript 5 |
| State Management | MobX 6 |
| Styling | Tailwind CSS 3 |
| Build Tool | Vite 5 |
| HTTP Client | Axios |
| Routing | React Router 6 |
| Icons | Lucide React |

## Support

- 📖 Full documentation: [showcase/README.md](showcase/README.md)
- 📚 Comprehensive guide: [docs/08-Showcase-Application.md](docs/08-Showcase-Application.md)
- 🐛 Issues: [GitHub Issues](https://github.com/AzerQ/notifications-service/issues)

## What Makes This Special?

🎯 **Targeted Notifications**: Unlike typical broadcast systems, notifications are delivered **only to specific users** using JWT claims and SignalR's `Clients.User()` method.

🔐 **Production-Ready Auth**: Full JWT authentication with BCrypt password hashing, automatic token refresh, and session persistence.

⚡ **Real-Time**: Instant notification delivery with automatic reconnection and connection state management.

🎨 **Modern UI**: Beautiful Tailwind CSS design with gradients, animations, and responsive layout.

📦 **Complete Stack**: Everything you need for a production notification system in one package.

---

**Ready to build your own notification system?** Start with this showcase and customize it to your needs! 🚀

# Configuration Guide

This document describes the configuration parameters for the Notification Service (Backend API) and the Notification Component (Frontend).

## 🖥️ Backend API Configuration

The backend configuration is located in `backend/src/NotificationService.Api/appsettings.json`.

### 1. General Settings
- `urls`: The address and port the service listens on (default: `http://*:5093`).
- `EnableSwaggerUI`: Boolean to enable/disable the Swagger documentation interface.

### 2. Database
- `ConnectionStrings:Notifications`: SQLite connection string (default: `Data Source=notifications.db`).

### 3. JWT Authentication
- `JwtSettings:SecretKey`: **Required**. The secret key used to sign JWT tokens.
- `JwtSettings:Issuer`: The issuer of the token.
- `JwtSettings:Audience`: The intended audience for the token.
- `JwtSettings:AccessTokenExpirationMinutes`: Lifetime of the access token.
- `JwtSettings:RefreshTokenExpirationHours`: Lifetime of the refresh token.

### 4. Email (SMTP)
- `Email:SmtpHost`: SMTP server address.
- `Email:SmtpPort`: SMTP server port (e.g., 587).
- `Email:EnableSsl`: Whether to use SSL/TLS.
- `Email:UserName`: SMTP username.
- `Email:Password`: SMTP password.
- `Email:FromAddress`: The email address shown as the sender.

### 5. Notification Cleanup
- `NotificationCleanup:Enabled`: Enable automatic deletion of old notifications.
- `NotificationCleanup:RetentionDays`: Number of days to keep notifications.
- `NotificationCleanup:Schedule`: Cron expression for the cleanup task (default: `0 0 2 * * ?` - every day at 2 AM).

---

## 🌐 Frontend Component Configuration

The frontend component is configured using environment variables (Vite) during the build process. Create a `.env` file in the `frontend/notification-component-mvp/` directory based on `.env.example`.

### Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the Backend API | `https://api.example.com` |
| `VITE_SIGNALR_URL` | URL for the SignalR Hub | `https://api.example.com/notificationHub` |
| `VITE_ENABLED_AUTH_METHODS` | Enabled auth methods (comma-separated) | `windows,email` |
| `VITE_ICONS_THEME` | Theme for icons (`light` or `dark`) | `light` |
| `VITE_STYLES_PATH` | Path to custom styles for Shadow DOM isolation | `/styles/custom.css` |

### Important Notes
- **User ID**: You do not need to provide a User ID in the configuration. It is automatically extracted from the JWT token on the backend.
- **Build**: These variables are injected at build time. If you change them, you must rebuild the frontend application.

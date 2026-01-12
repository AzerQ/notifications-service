# Integration Guide

Complete guide for integrating and embedding the notification service into existing applications.

## Table of Contents

1. [Embedding Backend API](#embedding-backend-api)
2. [Integrating Frontend Components](#integrating-frontend-components)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Integration Examples](#integration-examples)

---

## Embedding Backend API

### Option 1: Standalone Service

Run the notification service as a separate microservice.

**Advantages:**
- Independent scaling
- Separate deployment
- Technology independence

**Setup:**

```bash
cd backend
dotnet run --project src/NotificationService.Api
```

API will be available at `http://localhost:5093`

### Option 2: Embedded in Existing .NET Application

Integrate as a library in your existing ASP.NET Core application.

**Step 1: Add Project References**

```xml
<ItemGroup>
  <ProjectReference Include="path/to/NotificationService.Api/NotificationService.Api.csproj" />
  <ProjectReference Include="path/to/NotificationService.Application/NotificationService.Application.csproj" />
  <ProjectReference Include="path/to/NotificationService.Infrastructure/NotificationService.Infrastructure.csproj" />
</ItemGroup>
```

**Step 2: Configure Services in Program.cs**

```csharp
using NotificationService.Api;

var builder = WebApplication.CreateBuilder(args);

// Add notification services
builder.Services.AddNotificationServices(builder.Configuration);

// Add SignalR
builder.Services.AddSignalR();

var app = builder.Build();

// Map SignalR hub
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
```

**Step 3: Configure appsettings.json**

```json
{
  "ConnectionStrings": {
    "Notifications": "Data Source=notifications.db"
  },
  "Email": {
    "SmtpHost": "smtp.example.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "UserName": "your-email@example.com",
    "Password": "your-password",
    "FromAddress": "notifications@example.com",
    "FromName": "Notification Service"
  }
}
```

---

## Integrating Frontend Components

### Option 1: React Component

Install the notification component in your React application.

**Installation:**

```bash
npm install sed-notifications-frontend
# or
yarn add sed-notifications-frontend
```

**Usage:**

```tsx
import React from 'react';
import { NotificationCenterWithStore } from 'sed-notifications-frontend';
import 'sed-notifications-frontend/dist/styles.css';

function App() {
  return (
    <div className="app">
      <header>
        <NotificationCenterWithStore
          signalRUrl="http://localhost:5093/notificationHub"
          apiBaseUrl="http://localhost:5093/api"
          userId="your-user-guid"
          accessToken="your-jwt-token" // Optional for auth
        />
      </header>
      {/* Your app content */}
    </div>
  );
}

export default App;
```

### Option 2: Standalone Integration

Integrate using vanilla JavaScript/TypeScript.

**HTML:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Application</title>
    <script src="https://unpkg.com/@microsoft/signalr/dist/browser/signalr.min.js"></script>
</head>
<body>
    <div id="notification-bell">
        <span id="unread-count">0</span>
    </div>
    <div id="notification-list"></div>

    <script src="app.js"></script>
</body>
</html>
```

**JavaScript (app.js):**

```javascript
const userId = 'your-user-id';
const apiUrl = 'http://localhost:5093/api';
const hubUrl = 'http://localhost:5093/notificationHub';

// SignalR Connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build();

connection.on("ReceiveNotification", (notification) => {
    console.log("New notification:", notification);
    addNotificationToUI(notification);
    updateUnreadCount();
});

connection.start()
    .then(() => console.log("SignalR connected"))
    .catch(err => console.error("SignalR error:", err));

// Fetch notifications
async function loadNotifications() {
    const response = await fetch(`${apiUrl}/notification/by-user/${userId}`);
    const notifications = await response.json();
    renderNotifications(notifications);
}

// Mark as read
async function markAsRead(notificationId) {
    await fetch(`${apiUrl}/notification/${notificationId}/mark-read`, {
        method: 'PUT'
    });
}

// UI functions
function renderNotifications(notifications) {
    const list = document.getElementById('notification-list');
    list.innerHTML = notifications.map(n => `
        <div class="notification ${n.read ? 'read' : 'unread'}">
            <h3>${n.title}</h3>
            <p>${n.message}</p>
            <button onclick="markAsRead('${n.id}')">Mark as Read</button>
        </div>
    `).join('');
}

function updateUnreadCount() {
    // Implementation
}

loadNotifications();
```

---

## Configuration

### Backend Configuration

**appsettings.json:**

```json
{
  "ConnectionStrings": {
    "Notifications": "Data Source=notifications.db"
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "UserName": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromAddress": "noreply@yourapp.com",
    "FromName": "Your Application"
  },
  "JwtSettings": {
    "Secret": "your-secret-key-at-least-32-characters",
    "Issuer": "YourApp",
    "Audience": "YourAppUsers",
    "ExpirationMinutes": 60
  },
  "TemplateOptions": {
    "TemplateBasePath": "Notifications"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ]
  }
}
```

### Frontend Configuration

**Environment Variables (.env):**

```env
REACT_APP_API_BASE_URL=http://localhost:5093/api
REACT_APP_SIGNALR_HUB_URL=http://localhost:5093/notificationHub
REACT_APP_USER_ID=your-user-id
```

**Usage in React:**

```typescript
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
  signalRUrl: process.env.REACT_APP_SIGNALR_HUB_URL,
  userId: process.env.REACT_APP_USER_ID
};
```

### CORS Configuration

**In Backend Program.cs:**

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ... after building app
app.UseCors();
```

---

## Deployment

### Docker Deployment

**Dockerfile (Backend):**

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["NotificationService.Api/NotificationService.Api.csproj", "NotificationService.Api/"]
RUN dotnet restore "NotificationService.Api/NotificationService.Api.csproj"
COPY . .
WORKDIR "/src/NotificationService.Api"
RUN dotnet build "NotificationService.Api.csproj" -c Release -o /app/build
RUN dotnet publish "NotificationService.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NotificationService.Api.dll"]
```

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  notification-api:
    build: ./backend
    ports:
      - "5093:80"
    environment:
      - ConnectionStrings__Notifications=Data Source=/data/notifications.db
      - Email__SmtpHost=smtp.gmail.com
      - Email__SmtpPort=587
    volumes:
      - notification-data:/data

  notification-frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:5093/api
      - REACT_APP_SIGNALR_HUB_URL=http://localhost:5093/notificationHub

volumes:
  notification-data:
```

### Azure Deployment

1. **Create App Service**
2. **Configure Connection String**
3. **Deploy via GitHub Actions or Azure CLI**

### Production Checklist

- [ ] Use environment variables for sensitive configuration
- [ ] Configure HTTPS/TLS
- [ ] Set up proper CORS policies
- [ ] Configure logging and monitoring
- [ ] Set up database backups
- [ ] Configure email retry policies
- [ ] Set up health checks
- [ ] Configure rate limiting

---

## Integration Examples

### Example 1: E-commerce Integration

```csharp
// In your Order Service
public class OrderService
{
    private readonly INotificationCommandService _notificationService;

    public async Task CreateOrder(Order order)
    {
        // Save order
        await _orderRepository.SaveAsync(order);

        // Send notification
        await _notificationService.ProcessNotificationRequestAsync(new NotificationRequest
        {
            Route = "OrderCreated",
            Parameters = new Dictionary<string, object>
            {
                { "CustomerId", order.CustomerId },
                { "OrderNumber", order.OrderNumber },
                { "OrderTotal", order.Total },
                { "ItemCount", order.Items.Count }
            }
        });
    }
}
```

### Example 2: User Management Integration

```csharp
// In your User Registration
public class UserRegistrationService
{
    private readonly INotificationCommandService _notificationService;

    public async Task RegisterUser(User user)
    {
        // Create user
        await _userRepository.CreateAsync(user);

        // Send welcome notification
        await _notificationService.ProcessNotificationRequestAsync(new NotificationRequest
        {
            Route = "UserRegistered",
            Channel = "Email",
            Parameters = new Dictionary<string, object>
            {
                { "UserId", user.Id },
                { "WelcomeMessage", "Welcome to our platform!" }
            }
        });
    }
}
```

### Example 3: Task Management Integration

```csharp
// In your Task Service
public class TaskService
{
    private readonly INotificationCommandService _notificationService;

    public async Task AssignTask(Task task)
    {
        // Update task
        await _taskRepository.UpdateAsync(task);

        // Notify assignee
        await _notificationService.ProcessNotificationRequestAsync(new NotificationRequest
        {
            Route = "TaskAssigned",
            Parameters = new Dictionary<string, object>
            {
                { "AssigneeId", task.AssigneeId },
                { "AssignerId", task.AssignerId },
                { "TaskTitle", task.Title },
                { "TaskDescription", task.Description },
                { "Priority", task.Priority },
                { "DueDate", task.DueDate }
            }
        });
    }
}
```

---

## Next Steps

1. Review [API Documentation](./04-API.md) for endpoint details
2. Check [Developer Guide](./06-Development-Guide.md) for customization
3. Explore [Showcase Application](./08-Showcase-Application.md) for a complete example

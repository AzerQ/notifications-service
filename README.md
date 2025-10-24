# Generic Notification Service

A universal, extensible REST API notification service for sending notifications via multiple channels (Email, Database storage, and InApp with SignalR).

## Quick Start

- Requirements: .NET 8 SDK, SQLite (available out of the box)
- Build and run the API:
  
  ```bash
  git clone https://github.com/AzerQ/notifications-service.git
  cd notifications-service/backend
  dotnet build
  dotnet run --project src/NotificationService.Api
  ```

- Database Initialization:
  - On first start, the API automatically applies migrations and adds basic data (templates, test users)

## Configuration
- See `docs/reference/Configuration.md`
- Main parameters: `ConnectionStrings:Notifications` (SQLite), `Email` section (SMTP)

## Documentation
- Architecture: `docs/reference/Architecture.md`
- Configuration: `docs/reference/Configuration.md`
- Database and migrations: `docs/reference/Database.md`
- Notification templates: `docs/reference/Templates.md`
- API reference: `docs/reference/API.md`
- Developer guide: `docs/guides/DeveloperGuide.md`

## Example Requests

Create a notification:

```
POST /api/notification
Content-Type: application/json

{
  "title": "New Task",
  "message": "<h1>New Task</h1>",
  "recipientId": "00000000-0000-0000-0000-000000000001",
  "channel": "Email",
  "templateName": "TaskCreated",
  "parameters": {
    "TaskSubject": "Contract Approval"
  }
}
```

Get notifications by user:
```
GET /api/notification/by-user/{userId}
```

## Project Goals

### Objectives
Development of a universal, extensible REST API notification service with multiple delivery channels.

### Key Features

#### Notification Types
The service supports flexible notification types through templating:
1. **Task Created Notifications**
   - Task author
   - Task subject
   - Task description
   - Task type
   - Planned completion date
   - Creation date

2. **Task Completed Notifications**
   - Task executor
   - Task subject
   - Task description
   - Task type
   - Actual completion date
   - Creation date

3. **Custom Notifications**
   - Easily add new types via templates

#### Notification Structure
- Creation date
- Subject/Title
- Category
- Brief description
- Read flag
- Payload for each type

#### Delivery Channels
- Primary: Email
- Secondary: SQLite database storage
- Real-time: SignalR for InApp notifications
- Query notifications by user request

#### Functional Requirements
- Flexible addition of new notification types
- Customizable email templates
- User data from various sources
- Extensible architecture

## Architecture

### General Schema
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   REST API      │────│   Notification   │────│   Data Access   │
│   Controllers   │    │     Services     │    │      Layer      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Email Service  │    │ Template Engine  │    │   SQLite DB     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  SMTP Server    │    │  SignalR Hubs    │    │  User Providers │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Main Components

#### 1. Data Models
- `Notification` - base notification model
- `User` - user model
- `NotificationTemplate` - notification templates

#### 2. Services
- `INotificationService` - main notification service
- `IEmailService` - email sending service
- `ITemplateService` - template management service
- `IUserProvider` - user data provider

#### 3. Controllers
- `NotificationsController` - notification management
- `UsersController` - user data access

#### 4. Data Providers
- Internal database
- External sources (APIs)

### Technology Stack
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- System.Net.Mail (for email)
- SignalR (for real-time notifications)
- xUnit (for testing)

## Frontend Component

The project includes a React-based InApp notification component with SignalR support:
- Location: `frontend/sed-notifications-frontend`
- Technology: React, TypeScript, MobX, SignalR
- Features: Real-time notifications, notification center, toast alerts

## Example HTML Templates

### Task Created Notification
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Task</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Task</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p><strong>Author:</strong> {{AuthorName}}</p>
            <p><strong>Subject:</strong> {{TaskSubject}}</p>
            <p><strong>Description:</strong> {{TaskDescription}}</p>
            <p><strong>Task Type:</strong> {{TaskType}}</p>
            <p><strong>Due Date:</strong> {{DueDate}}</p>
            <p><strong>Created:</strong> {{CreatedDate}}</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px;">
            This notification was sent automatically.
        </p>
    </div>
</body>
</html>
```

### Task Completed Notification
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Task Completed</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Task Completed</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p><strong>Executor:</strong> {{ExecutorName}}</p>
            <p><strong>Subject:</strong> {{TaskSubject}}</p>
            <p><strong>Description:</strong> {{TaskDescription}}</p>
            <p><strong>Task Type:</strong> {{TaskType}}</p>
            <p><strong>Completion Date:</strong> {{CompletionDate}}</p>
            <p><strong>Created:</strong> {{CreatedDate}}</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px;">
            This notification was sent automatically.
        </p>
    </div>
</body>
</html>
```

## Development Principles

### SOLID Principles
- **S** - Each component has a single responsibility
- **O** - Open for extension, closed for modification
- **L** - Substitutability of derived classes
- **I** - Interface segregation by functionality
- **D** - Depend on abstractions, not implementations

### DRY and KISS
- Repeated code extracted into common components
- Simple and clear solutions
- Minimal dependencies

### Modularity
- Each component in a separate file
- Clear separation of concerns
- Easy to test and replace components

## Next Steps
1. Add SignalR hub for real-time notifications
2. Create generic test notification handlers
3. Build sample test application
4. Integrate InApp notification component
5. Add comprehensive testing
6. Update documentation
# Key System Components

This document describes the main components of the notification service with emphasis on concepts and interfaces.

## Domain Layer

### Notification (Domain Model)

The central entity of the system, representing a notification.

**Key Properties:**
- `Id` — unique notification identifier
- `Title` — notification title
- `Message` — main content/text of the notification
- `Route` — notification type/route (e.g., "UserRegistered")
- `CreatedAt` — creation date and time
- `Recipient` — notification recipient (User)
- `Template` — associated template for formatting
- `Metadata` — additional metadata in key-value format
- `DeliveryChannelsState` — delivery statuses by channel

**Feature:** Uses `ChannelsDefaultState()` method to initialize default delivery channels (Email and Push).

### NotificationChannelDeliveryStatus

Notification delivery status for a specific channel.

**Properties:**
- `NotificationChannel` — delivery channel (Email, SMS, Push)
- `DeliveryStatus` — delivery status (Pending, Sent, Failed, Skipped)

### NotificationMetadataField

Notification metadata in key-value-description format.

**Usage:** Stores additional parameters that can be used in templates or for analytics.

### User

User model for notification recipients.

**Key Properties:**
- `Id` — unique user identifier
- `Username` — username
- `Email` — email address for delivery
- `PhoneNumber` — phone number for SMS (optional)
- `DeviceToken` — device token for Push (optional)

### NotificationTemplate

Template for formatting notifications.

**Properties:**
- `Name` — unique template name
- `Subject` — subject/title
- `Content` — content (Handlebars template)

### UserRoutePreference

User preferences for notification routes.

**Usage:** Allows users to enable/disable specific notification types.

### Enumerations (Enums)

```csharp
// Notification delivery channels
public enum NotificationChannel
{
    Email,
    Sms,
    Push
}

// Delivery statuses
public enum NotificationDeliveryStatus
{
    Pending,   // Awaiting delivery
    Sent,      // Successfully sent
    Failed,    // Delivery error
    Skipped    // Skipped (disabled by user)
}
```

### Repository Interfaces

#### INotificationRepository

Interface for working with notifications in the database.

**Main Methods:**
- `GetNotificationByIdAsync(id)` — get notification by ID
- `GetNotificationsForUserAsync(userId)` — get all user notifications
- `GetNotificationsByStatusAsync(status)` — get notifications by status
- `SaveNotificationsAsync(notifications)` — save new notifications
- `UpdateNotificationsAsync(notifications)` — update existing notifications

#### IUserRepository

Interface for working with users.

**Main Methods:**
- `GetUserByIdAsync(id)` — get user by ID
- `GetAllUsersAsync()` — get all users
- `SaveUsersAsync(users)` — save users

#### ITemplateRepository

Interface for working with templates.

**Main Methods:**
- `GetTemplateByNameAsync(name)` — get template by name
- `GetAllTemplatesAsync()` — get all templates

### Provider Interfaces

#### IEmailProvider

Interface for sending email notifications.

```csharp
Task<bool> SendEmailAsync(string to, string subject, string body);
```

#### ISmsProvider

Interface for sending SMS notifications (for extension).

```csharp
Task<bool> SendSmsAsync(string phoneNumber, string message);
```

#### IPushNotificationProvider

Interface for sending Push notifications (for extension).

```csharp
Task<bool> SendPushNotificationAsync(string deviceToken, string title, string body);
```

### INotificationRouteConfiguration

Notification route configuration interface.

**Properties:**
- `RouteName` — route name (e.g., "UserRegistered")
- `TemplateName` — template name for this route
- `DefaultChannels` — default delivery channels

## Application Layer

### NotificationCommandService

Service for executing commands (creating and sending notifications).

**Main Method:**
- `ProcessNotificationRequestAsync(request)` — create and send notification

**Process:**
1. Get data resolver for the route
2. Get route configuration
3. Get template
4. Map and create notifications
5. Save to database
6. Send via channels
7. Return response

### NotificationQueryService

Service for executing queries (reading notifications).

**Main Methods:**
- `GetByIdAsync(id)` — get notification by ID
- `GetByUserAsync(userId)` — get user notifications
- `GetByStatusAsync(status)` — get notifications by status

### NotificationSender

Service for orchestrating notification delivery across various channels.

**Main Method:**
- `SendAsync(notification)` — send notification

**Process:**
1. Validate notification
2. Check user preferences
3. Send via all active channels (in parallel)
4. Update statuses in database

### NotificationRoutesContext

Registry of notification routes and their handlers.

**Functions:**
- `RegisterRoute(route, dataResolver, routeConfig)` — register new route
- `GetDataResolverForRoute(route)` — get resolver for route
- `GetNotificationRouteConfiguration(route)` — get route configuration

**Usage:** Automatically registers all handlers from the assembly on application startup.

### INotificationDataResolver

Interface for notification data resolvers.

**Methods:**
- `ResolveRecipientsAsync(parameters)` — get list of recipients
- `ResolveTemplateDataAsync(recipient, parameters)` — prepare data for template

**Concept:** Each notification type has its own resolver that knows how to retrieve data from various sources.

### NotificationMapper

Mapper for transformation between domain models and DTOs.

**Main Methods:**
- `MapFromRequest(request, resolver, template)` — create Notification from request
- `MapToResponse(notifications)` — transform to DTO for API response

**Mapping Process:**
1. Get recipients through resolver
2. For each recipient, get template data
3. Render template with data
4. Create Notification object
5. Determine delivery channels

### DTO (Data Transfer Objects)

#### NotificationRequest

Incoming request to create a notification.

**Properties:**
- `Route` — notification type (required)
- `Channel` — delivery channels (optional, default all)
- `Parameters` — parameters for resolver and template

#### NotificationResponseDto

API response with notification information.

**Properties:**
- `Id` — notification identifier
- `Title` — title
- `Message` — content
- `Route` — notification type
- `CreatedAt` — creation date
- `Recipient` — recipient information
- `ChannelStatuses` — delivery statuses by channel

## Infrastructure Layer

### NotificationDbContext

EF Core database context.

**DbSets:**
- `Notifications` — notifications
- `Users` — users
- `NotificationTemplates` — templates
- `NotificationMetadataFields` — metadata
- `NotificationChannelDeliveryStatuses` — delivery statuses
- `UserRoutePreferences` — user preferences

**Configuration:** Uses Fluent API to configure relationships and constraints.

### Repositories

Implementations of repository interfaces from the Domain layer:
- `NotificationRepository` — work with notifications
- `UserRepository` — work with users
- `TemplateRepository` — work with templates
- `UserRoutePreferenceRepository` — work with preferences

### SmtpEmailProvider

Implementation of email delivery via SMTP.

**Concept:** Uses `SmtpClientFactory` to create SMTP clients, allowing easy switching between real SMTP and mock implementations for testing.

**Configuration:**
- `SmtpHost` — SMTP server address
- `SmtpPort` — SMTP port
- `EnableSsl` — use SSL
- `UserName` — username
- `Password` — password
- `FromAddress` — sender address
- `FromName` — sender name

### HandlebarsTemplateRenderer

Template rendering using Handlebars.NET.

**Features:**
- Support for conditional blocks (`{{#if}}...{{/if}}`)
- Support for iteration (`{{#each}}...{{/each}}`)
- Registration of custom helpers for formatting

**Helper Examples:**
- `formatDate` — date formatting
- `uppercase` — convert to uppercase
- `ifEquals` — conditional display

### FileSystemTemplateProvider

Loading templates from the file system.

**Structure:**
```
Templates/
├── UserRegistered/
│   ├── UserRegistered.hbs
│   └── template.json
├── OrderCreated/
│   ├── OrderCreated.hbs
│   └── template.json
└── TaskAssigned/
    ├── TaskAssigned.hbs
    └── template.json
```

## API Layer

### NotificationController

REST API controller for working with notifications.

**Main Endpoints:**
- `POST /api/notification` — create and send notification
- `GET /api/notification/{id}` — get notification by ID
- `GET /api/notification/by-user/{userId}` — get user notifications
- `GET /api/notification/by-status/{status}` — get notifications by status
- `POST /api/notification/broadcast` — broadcast notification via SignalR

### NotificationHub

SignalR Hub for real-time notifications.

**Methods:**
- `BroadcastNotification(notification)` — send to all connected clients
- `SendToUser(userId, notification)` — send to specific user

**Events:**
- `ReceiveNotification` — event received by clients

## Notification Handlers (Test Handlers)

### Handler Structure

Each handler consists of:

1. **Data Resolver** — implements `INotificationDataResolver`
   - Retrieves recipient data by request parameters
   - Prepares data for template rendering

2. **Route Configuration** — implements `INotificationRouteConfiguration`
   - Defines route name
   - Specifies template name
   - Defines default delivery channels

3. **HTML Template** (`.hbs`) — Handlebars template
   - Contains HTML structure of the notification
   - Uses variables from the resolver

4. **Template Config** (`template.json`) — template metadata
   - Template name
   - Email subject
   - Description
   - Version

### Example Handlers

**UserRegistered** — welcome notification upon registration
- Gets user by UserId
- Prepares data: name, email, registration date
- Uses template with welcome message

**OrderCreated** — order confirmation
- Gets order information
- Prepares data: order number, total, item count
- Uses template with order details

**TaskAssigned** — task assignment notification
- Gets task and assignee information
- Prepares data: title, description, priority, deadline
- Uses template with task details

## Next Steps

1. Review the [API documentation](./04-API.md) for working with the service
2. Explore the [Frontend components](./05-Frontend.md)
3. Read the [Developer Guide](./06-Development-Guide.md) to add new handlers

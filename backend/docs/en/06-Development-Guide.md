# Developer Guide

Comprehensive guide for developing and extending the notification service.

## Table of Contents

1. [Adding a New Notification Type](#adding-a-new-notification-type)
2. [Adding a New Delivery Channel](#adding-a-new-delivery-channel)
3. [Working with Templates](#working-with-templates)
4. [Database Migrations](#database-migrations)
5. [Testing](#testing)
6. [Best Practices](#best-practices)

---

## Adding a New Notification Type

### Process Overview

To add a new notification type, you need to:

1. Create a Data Resolver
2. Create a Route Configuration
3. Create an Email Template
4. Create Template Metadata
5. Register the handler (automatic)

### Step 1: Create Data Resolver

Create a class that implements `INotificationDataResolver`:

**File:** `NotificationService.TestHandlers/Notifications/MyNotification/MyNotificationDataResolver.cs`

```csharp
using NotificationService.Application.Contracts.Notifications;
using NotificationService.Domain.Models;

namespace NotificationService.TestHandlers.Notifications.MyNotification
{
    public class MyNotificationDataResolver : INotificationDataResolver
    {
        private readonly IUserRepository _userRepository;

        public MyNotificationDataResolver(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<List<User>> ResolveRecipientsAsync(
            Dictionary<string, object> parameters)
        {
            // Extract required parameters
            var userId = Guid.Parse(parameters["UserId"].ToString()!);

            // Get recipients from database or external source
            var user = await _userRepository.GetUserByIdAsync(userId);

            return new List<User> { user };
        }

        public Task<Dictionary<string, object>> ResolveTemplateDataAsync(
            User recipient, 
            Dictionary<string, object> parameters)
        {
            // Prepare data for template rendering
            var templateData = new Dictionary<string, object>
            {
                { "UserName", recipient.Username },
                { "Email", recipient.Email },
                { "CustomField", parameters.GetValueOrDefault("CustomField", "default") }
            };

            return Task.FromResult(templateData);
        }
    }
}
```

### Step 2: Create Route Configuration

Create a class that implements `INotificationRouteConfiguration`:

**File:** `NotificationService.TestHandlers/Notifications/MyNotification/MyNotificationRouteConfig.cs`

```csharp
using NotificationService.Domain.Contracts.Notifications;
using NotificationService.Domain.Enums;

namespace NotificationService.TestHandlers.Notifications.MyNotification
{
    public class MyNotificationRouteConfig : INotificationRouteConfiguration
    {
        public string RouteName => "MyNotification";
        public string TemplateName => "MyNotification";
        public NotificationChannel[] DefaultChannels => new[]
        {
            NotificationChannel.Email,
            NotificationChannel.Push
        };
    }
}
```

### Step 3: Create Email Template

Create a Handlebars template file:

**File:** `NotificationService.TestHandlers/Notifications/MyNotification/MyNotification.hbs`

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hello {{UserName}}!</h1>
        </div>
        <p>This is your custom notification.</p>
        <p>{{CustomField}}</p>
        <p>Sent to: {{Email}}</p>
    </div>
</body>
</html>
```

### Step 4: Create Template Metadata

Create template configuration:

**File:** `NotificationService.TestHandlers/Notifications/MyNotification/template.json`

```json
{
  "name": "MyNotification",
  "subject": "Your Custom Notification",
  "description": "Custom notification for specific events",
  "version": "1.0.0"
}
```

### Step 5: Usage

The handler is automatically registered on application startup. Use it via API:

```bash
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "MyNotification",
    "channel": "Email",
    "parameters": {
      "UserId": "guid-here",
      "CustomField": "Custom value"
    }
  }'
```

---

## Adding a New Delivery Channel

### Step 1: Define Provider Interface (if not exists)

**File:** `NotificationService.Domain/Contracts/Notifications/IMyChannelProvider.cs`

```csharp
namespace NotificationService.Domain.Contracts.Notifications
{
    public interface IMyChannelProvider
    {
        Task<bool> SendAsync(string recipient, string title, string content);
    }
}
```

### Step 2: Implement Provider

**File:** `NotificationService.Infrastructure/Notifications/MyChannelProvider.cs`

```csharp
using NotificationService.Domain.Contracts.Notifications;

namespace NotificationService.Infrastructure.Notifications
{
    public class MyChannelProvider : IMyChannelProvider
    {
        public async Task<bool> SendAsync(string recipient, string title, string content)
        {
            // Implement your delivery logic
            // e.g., call external API, send to queue, etc.
            
            return true; // Return success/failure
        }
    }
}
```

### Step 3: Register in DI

**File:** `NotificationService.Api/Program.cs` or DI configuration extension

```csharp
services.AddScoped<IMyChannelProvider, MyChannelProvider>();
```

### Step 4: Update NotificationSender

Add your channel to the sending logic in `NotificationSender.cs`.

---

## Working with Templates

### Template Syntax

Templates use Handlebars syntax with custom helpers.

#### Variables

```handlebars
{{UserName}}
{{Email}}
{{OrderTotal}}
```

#### Conditionals

```handlebars
{{#if IsVIP}}
  <p>Thank you for being a VIP member!</p>
{{/if}}
```

#### Loops

```handlebars
{{#each Items}}
  <li>{{Name}} - ${{Price}}</li>
{{/each}}
```

#### Custom Helpers

**formatDate:**
```handlebars
{{formatDate DueDate "dd.MM.yyyy"}}
```

**uppercase:**
```handlebars
{{uppercase UserName}}
```

### Adding Custom Helpers

**File:** `NotificationService.Infrastructure/Templating/HandlebarsTemplateRenderer.cs`

```csharp
Handlebars.RegisterHelper("myHelper", (writer, context, parameters) =>
{
    var value = parameters[0].ToString();
    writer.WriteSafeString(value.ToUpper());
});
```

---

## Database Migrations

### Creating a Migration

```bash
cd backend/src/NotificationService.Infrastructure
dotnet ef migrations add MigrationName --startup-project ../NotificationService.Api
```

### Applying Migrations

```bash
dotnet ef database update --startup-project ../NotificationService.Api
```

### Reverting Migration

```bash
dotnet ef database update PreviousMigrationName --startup-project ../NotificationService.Api
```

---

## Testing

### Unit Tests

**Location:** `tests/NotificationService.*.Tests/`

**Example:**
```csharp
[Fact]
public async Task SendAsync_ValidNotification_ReturnsSuccess()
{
    // Arrange
    var mockProvider = new Mock<IEmailProvider>();
    mockProvider.Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
        .ReturnsAsync(true);

    var sender = new NotificationSender(mockProvider.Object);

    // Act
    var result = await sender.SendAsync(notification);

    // Assert
    Assert.True(result);
}
```

### Integration Tests

Test complete workflows:

```csharp
[Fact]
public async Task ProcessNotification_EndToEnd_Success()
{
    // Arrange
    var request = new NotificationRequest
    {
        Route = "UserRegistered",
        Parameters = new Dictionary<string, object>
        {
            { "UserId", Guid.NewGuid() }
        }
    };

    // Act
    var response = await _commandService.ProcessNotificationRequestAsync(request);

    // Assert
    Assert.NotNull(response);
    Assert.Equal("UserRegistered", response.Route);
}
```

### Running Tests

```bash
cd backend
dotnet test
```

---

## Best Practices

### Code Organization

1. Keep handlers in separate folders under `Notifications/`
2. Use meaningful names for routes and templates
3. Follow naming conventions: `[RouteName]DataResolver`, `[RouteName]RouteConfig`

### Error Handling

1. Always validate parameters in data resolvers
2. Handle null recipients gracefully
3. Log errors but don't throw exceptions to clients

### Performance

1. Use async/await for all I/O operations
2. Batch database queries when possible
3. Consider caching for frequently accessed data

### Security

1. Validate all input parameters
2. Sanitize data before template rendering
3. Use parameterized queries
4. Don't expose sensitive data in logs

### Template Design

1. Keep templates simple and maintainable
2. Use semantic HTML
3. Ensure mobile responsiveness
4. Test templates in multiple email clients

---

## Next Steps

1. Review [API Reference](./04-API.md) for endpoint details
2. Check [Integration Guide](./07-Integration-Guide.md) for deployment
3. Explore existing handlers in `NotificationService.TestHandlers/` for examples

# InApp Notification Structure Documentation

## Overview

This document describes the complete structure of InApp notifications in the notification service system. The InApp notification model provides a rich, extensible format for delivering notifications to frontend applications via SignalR.

## Backend API Structure

### InAppNotification Model

The backend API uses the `InAppNotification` model defined in `NotificationService.Domain.Models.InApp.InAppNotification`:

```csharp
public record InAppNotification
{
    public string Id { get; set; }                        // Unique identifier
    public string? Type { get; set; }                     // Notification type/category
    public required string Title { get; set; }            // Notification title
    public required string Content { get; set; }          // Full notification content
    public string? ContentShortTemplate { get; set; }     // Template for compact display
    public object? Data { get; set; }                     // Template substitution data
    public DateTime Date { get; set; }                    // Creation timestamp
    public bool Read { get; set; }                        // Read status
    public string? Author { get; set; }                   // Notification author
    public List<NotificationAction>? Actions { get; set; } // Available actions
    public List<string>? Hashtags { get; set; }           // Associated hashtags
    public List<NotificationParameter>? Parameters { get; set; } // Additional metadata
}
```

### Supporting Types

#### NotificationAction
```csharp
public record NotificationAction
{
    public required string Name { get; set; }   // Action identifier
    public required string Label { get; set; }  // Display label
    public required string Url { get; set; }    // Action URL
}
```

#### NotificationParameter
```csharp
public record NotificationParameter
{
    public required string Key { get; set; }          // Parameter name
    public required string Value { get; set; }        // Parameter value
    public required string Description { get; set; }  // Human-readable description
}
```

## Frontend Structure

### TypeScript/JavaScript Interface

The frontend uses a compatible interface for InApp notifications:

```typescript
export interface Notification {
  id: string;
  type?: string;
  title: string;
  content: string;
  contentShortTemplate?: string;
  data?: any;
  date: string;
  read: boolean;
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
  
  // Backward compatibility aliases
  message?: string;      // alias for content
  route?: string;        // alias for type
  createdAt?: string;    // alias for date
  userId?: string;       // for filtering
}

export interface NotificationAction {
  name: string;
  label: string;
  url: string;
}

export interface NotificationParameter {
  key: string;
  value: string;
  description: string;
}
```

## Field Descriptions

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the notification |
| `title` | string | Yes | Short, descriptive title of the notification |
| `content` | string | Yes | Full notification message content |
| `date` | DateTime/string | Yes | Timestamp when notification was created |
| `read` | boolean | Yes | Whether the notification has been read by the user |

### Extended Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Category or type of notification (e.g., "UserRegistered", "OrderCreated") |
| `contentShortTemplate` | string | No | Template string for compact display. Supports Handlebars-style substitution with `data` |
| `data` | object | No | Data object for template substitution in `contentShortTemplate` |
| `author` | string | No | Name or identifier of the notification sender |
| `actions` | NotificationAction[] | No | Array of actionable buttons/links |
| `hashtags` | string[] | No | Tags for categorization and filtering |
| `parameters` | NotificationParameter[] | No | Additional key-value metadata with descriptions |

## Usage Examples

### Example 1: Basic Notification

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "Info",
  "title": "System Update",
  "content": "The system will be updated tonight at 2 AM.",
  "date": "2025-11-05T14:30:00Z",
  "read": false
}
```

### Example 2: Rich Notification with Actions

```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "type": "TaskAssigned",
  "title": "New Task Assigned",
  "content": "You have been assigned to work on the notification service enhancement.",
  "contentShortTemplate": "Task: {{taskName}} - Due {{dueDate}}",
  "data": {
    "taskName": "Notification Enhancement",
    "dueDate": "Nov 10"
  },
  "date": "2025-11-05T14:30:00Z",
  "read": false,
  "author": "Project Manager",
  "actions": [
    {
      "name": "view",
      "label": "View Task",
      "url": "/tasks/123"
    },
    {
      "name": "accept",
      "label": "Accept",
      "url": "/tasks/123/accept"
    }
  ],
  "hashtags": ["urgent", "development", "backend"],
  "parameters": [
    {
      "key": "priority",
      "value": "high",
      "description": "Task priority level"
    },
    {
      "key": "estimatedHours",
      "value": "8",
      "description": "Estimated hours to complete"
    }
  ]
}
```

### Example 3: Order Notification

```json
{
  "id": "323e4567-e89b-12d3-a456-426614174000",
  "type": "OrderCreated",
  "title": "Order Confirmed",
  "content": "Your order #ORD-12345 has been confirmed and is being processed.",
  "contentShortTemplate": "Order {{orderNumber}}: {{itemCount}} items - ${{total}}",
  "data": {
    "orderNumber": "ORD-12345",
    "itemCount": 3,
    "total": "299.99"
  },
  "date": "2025-11-05T14:30:00Z",
  "read": false,
  "actions": [
    {
      "name": "view",
      "label": "View Order",
      "url": "/orders/12345"
    },
    {
      "name": "track",
      "label": "Track Shipment",
      "url": "/orders/12345/track"
    }
  ],
  "hashtags": ["order", "confirmed"],
  "parameters": [
    {
      "key": "orderTotal",
      "value": "299.99",
      "description": "Total order amount"
    },
    {
      "key": "paymentMethod",
      "value": "Credit Card",
      "description": "Payment method used"
    }
  ]
}
```

## SignalR Integration

### Sending Notifications

Notifications are sent to clients via SignalR Hub:

```csharp
// Send to specific user
await hubContext.Clients.User(userId)
    .SendAsync("ReceiveNotification", inAppNotification);

// Send to all users (broadcast)
await hubContext.Clients.All
    .SendAsync("ReceiveNotification", inAppNotification);
```

### Receiving Notifications (Frontend)

```typescript
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/notificationHub', {
    accessTokenFactory: () => jwtToken
  })
  .withAutomaticReconnect()
  .build();

connection.on('ReceiveNotification', (notification: Notification) => {
  console.log('Received:', notification);
  // Handle the notification in your UI
  displayNotification(notification);
});

await connection.start();
```

## Backward Compatibility

The system maintains backward compatibility through field aliases:

- `content` can be accessed as `message`
- `date` can be accessed as `createdAt`
- `type` can be accessed as `route`

Frontend code should normalize incoming notifications:

```typescript
function normalizeNotification(notification: any): Notification {
  return {
    ...notification,
    message: notification.content || notification.message,
    route: notification.type || notification.route,
    createdAt: notification.date || notification.createdAt,
  };
}
```

## Best Practices

### For Backend Developers

1. **Always provide required fields**: `id`, `title`, `content`, `date`, `read`
2. **Use meaningful types**: Use descriptive type names like "TaskAssigned", "OrderCreated"
3. **Keep content concise**: Use `contentShortTemplate` for compact displays
4. **Provide actionable items**: Include relevant actions when users can take action
5. **Add metadata**: Use parameters for additional context

### For Frontend Developers

1. **Handle all optional fields gracefully**: Check for existence before rendering
2. **Implement fallbacks**: Use `content` if `contentShortTemplate` is not available
3. **Make actions clickable**: Render actions as buttons or links
4. **Display hashtags**: Use hashtags for filtering and categorization
5. **Show parameters contextually**: Display parameters in expandable sections

### For API Consumers

1. **Use the broadcast endpoint for testing**: `/api/notification/broadcast`
2. **Authenticate for targeted delivery**: Use JWT tokens for user-specific notifications
3. **Test with rich data**: Include actions, hashtags, and parameters in tests
4. **Handle connection failures**: Implement reconnection logic for SignalR

## Migration Guide

### From Old Format to New Format

If you have existing code using the old notification format:

**Old Format:**
```typescript
interface OldNotification {
  id: string;
  title: string;
  message: string;
  route: string;
  createdAt: string;
}
```

**New Format:**
```typescript
interface NewNotification {
  id: string;
  title: string;
  content: string;  // was: message
  type: string;     // was: route
  date: string;     // was: createdAt
  // ... plus new optional fields
}
```

**Migration Steps:**

1. Update field names in your code
2. Add handlers for new optional fields
3. Test backward compatibility with normalization
4. Update UI to display new fields

## Testing

### Test Application

The test application (`testapp/index.html`) demonstrates full InApp notification support:

```bash
cd testapp
./start.sh  # or start.bat on Windows
```

Open http://localhost:8080 to test notifications with all fields.

### Showcase Application

The showcase application provides a complete example with authentication:

```bash
cd showcase
./start.sh  # or start.bat on Windows
```

Open http://localhost:3000 to see the full implementation.

## API Endpoints

### Send Notification (with full InApp support)

```http
POST /api/notification/{category}/{route}
Content-Type: application/json
Authorization: Bearer {token}

{
  "route": "UserRegistered",
  "channel": "Email",
  "parameters": {
    "UserId": "00000000-0000-0000-0000-000000000001",
    "WelcomeMessage": "Welcome!"
  }
}
```

### Broadcast Notification (testing)

```http
POST /api/notification/broadcast
Content-Type: application/json
Authorization: Bearer {token}

{
  "id": "test-123",
  "type": "Test",
  "title": "Test Notification",
  "content": "This is a test",
  "date": "2025-11-05T14:30:00Z",
  "read": false,
  "author": "Admin",
  "actions": [...],
  "hashtags": [...],
  "parameters": [...]
}
```

### Get User Notifications

```http
GET /api/notification/by-user/{userId}
Authorization: Bearer {token}
```

Returns an array of notifications in the InAppNotification format.

## Troubleshooting

### Notifications Not Appearing

1. Check SignalR connection status
2. Verify JWT token is valid and included
3. Check browser console for errors
4. Ensure backend is running and accessible

### Missing Fields

1. Verify backend is sending all fields
2. Check field name compatibility (content vs message)
3. Update frontend types to match backend
4. Test with broadcast endpoint first

### Actions Not Working

1. Ensure URLs are absolute or properly routed
2. Handle action clicks with stopPropagation
3. Validate action structure (name, label, url)

## Related Documentation

- [Main README](../README.md)
- [API Documentation](./04-API.md)
- [Frontend Components](./05-Frontend.md)
- [Integration Guide](./07-Integration-Guide.md)

## Version History

- **v2.0** (2025-11-05): Added InAppNotification support with rich fields
- **v1.0** (2025-10-27): Initial notification structure

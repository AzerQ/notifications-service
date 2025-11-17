# API Reference

Complete documentation of the notification service REST API and SignalR Hub.

## Base URL

```
http://localhost:5093/api
```

## REST API Endpoints

### 1. Create and Send Notification

**Endpoint:** `POST /api/notification`

**Description:** Creates a notification, saves it to the database, and sends it via specified channels.

**Request Body:**

```json
{
  "route": "string",
  "channel": "string", // optional: "Email", "Sms", "Push", "Email,Push"
  "parameters": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Parameters:**
- `route` (required) — notification type/route (e.g., "UserRegistered", "OrderCreated")
- `channel` (optional) — delivery channels, comma-separated. Uses all available by default
- `parameters` (required) — parameters for data resolver and template

**Response (200 OK):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Welcome!",
  "message": "Welcome to our service, John!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipient": {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "channelStatuses": [
    {
      "channel": "Email",
      "status": "Sent"
    }
  ]
}
```

**Example Request (UserRegistered):**

```bash
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "UserRegistered",
    "channel": "Email",
    "parameters": {
      "UserId": "00000000-0000-0000-0000-000000000001",
      "WelcomeMessage": "Welcome aboard!"
    }
  }'
```

**Example Request (OrderCreated):**

```bash
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "OrderCreated",
    "channel": "Email",
    "parameters": {
      "CustomerId": "00000000-0000-0000-0000-000000000001",
      "OrderNumber": "ORD-12345",
      "OrderTotal": 299.99,
      "ItemCount": 3
    }
  }'
```

**Example Request (TaskAssigned):**

```bash
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "TaskAssigned",
    "channel": "Email",
    "parameters": {
      "AssigneeId": "00000000-0000-0000-0000-000000000001",
      "AssignerId": "00000000-0000-0000-0000-000000000002",
      "TaskTitle": "Complete project",
      "TaskDescription": "Finish the notification service",
      "Priority": "High",
      "DueDate": "2025-12-31T23:59:59Z"
    }
  }'
```

### 2. Get Notification by ID

**Endpoint:** `GET /api/notification/{id}`

**Description:** Retrieves a specific notification by its ID.

**Parameters:**
- `id` (path, required) — notification identifier (GUID)

**Response (200 OK):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Welcome!",
  "message": "Welcome to our service, John!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipient": {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "channelStatuses": [
    {
      "channel": "Email",
      "status": "Sent"
    }
  ]
}
```

**Example Request:**

```bash
curl http://localhost:5093/api/notification/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### 3. Get Notifications by User

**Endpoint:** `GET /api/notification/by-user/{userId}`

**Description:** Retrieves all notifications for a specific user.

**Parameters:**
- `userId` (path, required) — user identifier (GUID)

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Welcome!",
    "message": "Welcome to our service, John!",
    "route": "UserRegistered",
    "createdAt": "2025-10-28T10:30:00Z",
    "channelStatuses": [...]
  },
  {
    "id": "4fb96f75-6828-5673-c4gd-3d074g77bfb7",
    "title": "Order Confirmation",
    "message": "Your order #ORD-12345 has been placed",
    "route": "OrderCreated",
    "createdAt": "2025-10-28T11:00:00Z",
    "channelStatuses": [...]
  }
]
```

**Example Request:**

```bash
curl http://localhost:5093/api/notification/by-user/00000000-0000-0000-0000-000000000001
```

### 4. Get Notifications by Status

**Endpoint:** `GET /api/notification/by-status/{status}`

**Description:** Retrieves all notifications with a specific delivery status.

**Parameters:**
- `status` (path, required) — delivery status: "Pending", "Sent", "Failed", "Skipped"

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Welcome!",
    "message": "Welcome to our service, John!",
    "route": "UserRegistered",
    "createdAt": "2025-10-28T10:30:00Z",
    "channelStatuses": [
      {
        "channel": "Email",
        "status": "Sent"
      }
    ]
  }
]
```

**Example Request:**

```bash
curl http://localhost:5093/api/notification/by-status/Sent
```

### 5. Broadcast Notification via SignalR

**Endpoint:** `POST /api/notification/broadcast`

**Description:** Broadcasts a notification to all connected SignalR clients (for testing).

**Request Body:**

```json
{
  "title": "System Announcement",
  "message": "The system will be under maintenance at 2 AM",
  "route": "SystemAnnouncement"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Notification broadcasted successfully"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5093/api/notification/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a broadcast test",
    "route": "Test"
  }'
```

### 6. Mark Notification as Read

**Endpoint:** `PUT /api/notification/{id}/mark-read`

**Description:** Marks a notification as read.

**Parameters:**
- `id` (path, required) — notification identifier (GUID)

**Response (200 OK):**

```json
{
  "success": true
}
```

**Example Request:**

```bash
curl -X PUT http://localhost:5093/api/notification/3fa85f64-5717-4562-b3fc-2c963f66afa6/mark-read
```

## User Management Endpoints

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Description:** Retrieves all registered users.

**Response (200 OK):**

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "username": "john_doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "deviceToken": null
  }
]
```

### 2. Get User by ID

**Endpoint:** `GET /api/users/{id}`

**Description:** Retrieves a specific user by ID.

**Parameters:**
- `id` (path, required) — user identifier (GUID)

**Response (200 OK):**

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "deviceToken": null
}
```

### 3. Create User

**Endpoint:** `POST /api/users`

**Description:** Creates a new user.

**Request Body:**

```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "phoneNumber": "+1234567891",
  "deviceToken": null
}
```

**Response (201 Created):**

```json
{
  "id": "00000000-0000-0000-0000-000000000002",
  "username": "jane_doe",
  "email": "jane@example.com",
  "phoneNumber": "+1234567891",
  "deviceToken": null
}
```

## User Route Preferences Endpoints

### 1. Get User Preferences

**Endpoint:** `GET /api/user-route-preferences/{userId}`

**Description:** Retrieves notification preferences for a user.

**Parameters:**
- `userId` (path, required) — user identifier (GUID)

**Response (200 OK):**

```json
[
  {
    "userId": "00000000-0000-0000-0000-000000000001",
    "route": "UserRegistered",
    "isEnabled": true
  },
  {
    "userId": "00000000-0000-0000-0000-000000000001",
    "route": "OrderCreated",
    "isEnabled": true
  }
]
```

### 2. Update User Preference

**Endpoint:** `PUT /api/user-route-preferences`

**Description:** Updates a user's preference for a specific notification route.

**Request Body:**

```json
{
  "userId": "00000000-0000-0000-0000-000000000001",
  "route": "OrderCreated",
  "isEnabled": false
}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

## SignalR Hub

### Connection

**Hub URL:** `http://localhost:5093/notificationHub`

### Authentication

For targeted notifications (user-specific), include JWT token:

```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5093/notificationHub", {
        accessTokenFactory: () => yourJwtToken
    })
    .withAutomaticReconnect()
    .build();
```

For broadcast notifications (no authentication):

```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5093/notificationHub")
    .withAutomaticReconnect()
    .build();
```

### Events

#### ReceiveNotification

Fired when a notification is received (either targeted or broadcast).

**Event Handler:**

```typescript
connection.on("ReceiveNotification", (notification) => {
    console.log("Received notification:", notification);
    // notification object structure:
    // {
    //   id: "guid",
    //   title: "string",
    //   message: "string",
    //   route: "string",
    //   createdAt: "ISO date string"
    // }
});
```

### Methods

#### Server Methods (Called from Client)

No client-to-server methods are currently exposed. Communication is server-to-client only.

## Data Models

### NotificationRequest

```typescript
interface NotificationRequest {
  route: string;
  channel?: string; // "Email", "Sms", "Push", or combinations like "Email,Push"
  parameters: Record<string, any>;
}
```

### NotificationResponseDto

```typescript
interface NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  route: string;
  createdAt: string; // ISO date string
  recipient: UserDto;
  channelStatuses: ChannelStatusDto[];
}
```

### UserDto

```typescript
interface UserDto {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  deviceToken?: string;
}
```

### ChannelStatusDto

```typescript
interface ChannelStatusDto {
  channel: "Email" | "Sms" | "Push";
  status: "Pending" | "Sent" | "Failed" | "Skipped";
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- **200 OK** — Request successful
- **201 Created** — Resource created successfully
- **400 Bad Request** — Invalid request parameters
- **404 Not Found** — Resource not found
- **500 Internal Server Error** — Server error

**Error Response Format:**

```json
{
  "error": "Error message description",
  "details": "Detailed error information"
}
```

## Examples

### Complete Workflow Example

1. **Create a user:**
```bash
curl -X POST http://localhost:5093/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com"
  }'
```

2. **Send a notification:**
```bash
curl -X POST http://localhost:5093/api/notification \
  -H "Content-Type: application/json" \
  -d '{
    "route": "UserRegistered",
    "channel": "Email",
    "parameters": {
      "UserId": "returned-user-id-from-step-1",
      "WelcomeMessage": "Welcome Alice!"
    }
  }'
```

3. **Get user notifications:**
```bash
curl http://localhost:5093/api/notification/by-user/{userId}
```

### SignalR Integration Example

```typescript
import * as signalR from '@microsoft/signalr';

// Create connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5093/notificationHub", {
        accessTokenFactory: () => getJwtToken() // Your JWT token function
    })
    .withAutomaticReconnect()
    .build();

// Listen for notifications
connection.on("ReceiveNotification", (notification) => {
    console.log("New notification:", notification);
    showToast(notification.title, notification.message);
});

// Start connection
await connection.start();
console.log("SignalR connected!");
```

## Next Steps

1. Review [Frontend Components](./05-Frontend.md) for UI integration
2. Read [Developer Guide](./06-Development-Guide.md) to add custom notification handlers
3. Check [Integration Guide](./07-Integration-Guide.md) for deployment scenarios

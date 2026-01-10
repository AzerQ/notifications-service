# API Reference

Complete documentation of the notification service REST API and SignalR Hub.

## Base URL

```
http://localhost:5093/api
```

## REST API Endpoints

### 1. Create and Send Notification

**Endpoint:** `POST /api/notification/{route}` or `POST /api/notification/{notificationCategory}/{route}`

**Description:** Creates a notification, saves it to the database, and sends it via specified channels.

**Request Body:**

```json
{
  "title": "string", // optional
  "message": "string", // optional
  "channels": ["Email", "InApp"], // optional
  "parameters": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Parameters:**
- `route` (path, required) — notification type/route (e.g., "UserRegistered", "OrderCreated")
- `notificationCategory` (path, optional) — notification category
- `title` (optional) — override title
- `message` (optional) — override content
- `channels` (optional) — array of delivery channels (`Email`, `InApp`). Uses all available for the route by default.
- `parameters` (required) — parameters for data resolver and template

**Response (201 Created):**

```json
{
  "title": "Welcome!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipients": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ],
  "createdNotificationIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ],
  "statusMessage": "Notification sended successfully"
}
```

**Example Request (UserRegistered):**

```bash
curl -X POST http://localhost:5093/api/notification/UserRegistered \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "UserId": "00000000-0000-0000-0000-000000000001",
      "WelcomeMessage": "Welcome aboard!"
    }
  }'
```

**Example Request (OrderCreated):**

```bash
curl -X POST http://localhost:5093/api/notification/OrderCreated \
  -H "Content-Type: application/json" \
  -d '{
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
curl -X POST http://localhost:5093/api/notification/TaskAssigned \
  -H "Content-Type: application/json" \
  -d '{
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
  "title": "Welcome!",
  "route": "UserRegistered",
  "createdAt": "2025-10-28T10:30:00Z",
  "recipients": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "createdAt": "2025-10-28T10:00:00Z"
    }
  ],
  "createdNotificationIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ],
  "statusMessage": "Notification sended successfully"
}
```

**Example Request:**

```bash
curl http://localhost:5093/api/notification/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### 3. Get Personal Notifications

**Endpoint:** `GET /api/notification/personal`

**Description:** Retrieves notifications for the current authenticated user.

**Query Parameters:**
- `OnlyUnread` (boolean) — only unread (default: false)
- `PageSize` (int) — page size (default: 50)
- `PageNumber` (int) — page number (default: 1)

**Response (200 OK):**

```json
{
  "notifications": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "receiverId": "00000000-0000-0000-0000-000000000001",
      "type": "User",
      "subType": "UserRegistered",
      "title": "Welcome!",
      "content": "Welcome to our service!",
      "url": "https://example.com",
      "icon": { "name": "user" },
      "date": "2025-10-28T10:30:00Z",
      "read": false,
      "hashtags": ["user", "registration"]
    }
  ],
  "request": {
    "onlyUnread": false,
    "pageSize": 50,
    "pageNumber": 1
  },
  "totalItemsCount": 1
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5093/api/notification/personal?OnlyUnread=true" \
  -H "Authorization: Bearer {token}"
```

---

### 4. Mark All Notifications as Read

**Endpoint:** `PUT /api/notification/personal/mark-all-read`

**Description:** Marks all notifications for the current user as read.

**Response (200 OK):** Empty body.

---

### 5. Set Read Flag for Specific Notification

**Endpoint:** `PUT /api/notification/set-read-flag`

**Query Parameters:**
- `notificationId` (Guid) — notification ID
- `flagValue` (boolean) — flag value

**Response (200 OK):** Success message.

---

### 6. Search Notifications (Admin only)

**Endpoint:** `POST /api/notification/search`

**Description:** Advanced search for notifications using filters.

---

### 7. Broadcast Notification via SignalR (Admin only)

**Endpoint:** `POST /api/notification/broadcast`

**Description:** Broadcasts a notification to all connected SignalR clients.

**Request Body:**

```json
{
  "title": "string",
  "content": "string",
  "url": "string",
  "type": "string"
}
```

**Response (200 OK):**

```json
{
  "message": "Notification broadcast successfully"
}
```

---

## User Management Endpoints

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Description:** Retrieves all registered users.

**Response (200 OK):**

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "createdAt": "2025-10-28T10:00:00Z",
    "deviceToken": "token",
    "role": "User",
    "accountName": "DOMAIN\\user"
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
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "createdAt": "2025-10-28T10:00:00Z",
  "deviceToken": "token",
  "role": "User",
  "accountName": "DOMAIN\\user"
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

**Endpoint:** `GET /api/users/{userId}/routes`

**Description:** Retrieves notification preferences for a user.

**Parameters:**
- `userId` (path, required) — user identifier (GUID)

**Response (200 OK):**

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userId": "00000000-0000-0000-0000-000000000001",
    "route": "UserRegistered",
    "enabled": true,
    "routeDisplayName": "User Registered",
    "routeDescription": "..."
  }
]
```

### 2. Update User Preferences

**Endpoint:** `PUT /api/users/{userId}/routes`

**Description:** Updates a user's preferences for notification routes.

**Request Body:**

```json
[
  {
    "route": "OrderCreated",
    "enabled": false
  }
]
```

**Response (204 No Content)**

## Authentication API

### 1. Send Verification Code to Email

**Endpoint:** `POST /api/auth/email/sendCode?email={email}`

**Response:** `CreatedMailChallengeResponse { challengeId, message }`

### 2. Login by Email and Code

**Endpoint:** `POST /api/auth/email`

**Request Body:** `MailChallengeSubmit { id, code }`

**Response:** `LoginTokensResponse { refreshToken, accessToken }`

### 3. Login via Windows Authentication

**Endpoint:** `POST /api/auth/windows`

**Response:** `LoginTokensResponse`

### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request Body:** `RefreshTokenRequest { refreshTokenValue }`

**Response:** `AccessTokenResponse { accessToken }`

---

## SignalR Hub

### Connection

**Hub URL:** `http://localhost:5093/notificationHub`

### Authentication

Requires JWT token via `access_token` query parameter.

```typescript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5093/notificationHub", {
        accessTokenFactory: () => yourJwtToken
    })
    .withAutomaticReconnect()
    .build();
```

### Events

#### ReceiveNotification

Fired when a notification is received.

**Event Handler:**

```typescript
connection.on("ReceiveNotification", (notification: AppNotification) => {
    console.log("Received notification:", notification);
});
```

### Methods

#### Server Methods (Called from Client)

No client-to-server methods are currently exposed. Communication is server-to-client only.

## Data Models

### NotificationRequest

```typescript
interface NotificationRequest {
  title?: string;
  message?: string;
  channels?: ("Email" | "InApp")[];
  parameters: Record<string, any>;
}
```

### NotificationResponseDto

```typescript
interface NotificationResponseDto {
  title?: string;
  route: string;
  createdAt: string;
  recipients: UserDto[];
  createdNotificationIds: string[];
  statusMessage: string;
}
```

### UserDto

```typescript
interface UserDto {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
}
```

### AppNotification (SignalR / Personal API)

```typescript
interface AppNotification {
  id: string;
  receiverId: string;
  type?: string;
  subType?: string;
  title: string;
  content: string;
  url: string;
  icon?: { name: string, cssClass?: string };
  date: string;
  read: boolean;
  author?: string;
  actions?: { name: string, label: string, url: string }[];
  hashtags?: string[];
  parameters?: { key: string, value: string, description: string }[];
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
curl -H "Authorization: Bearer {token}" http://localhost:5093/api/notification/personal
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

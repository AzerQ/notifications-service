# Frontend Components

Documentation for the notification system frontend components.

## Overview

The frontend part of the project is a React application written in TypeScript using MobX for state management and SignalR for real-time communication.

**Location:** `frontend/sed-notifications-frontend/`

**Technologies:**
- React 18
- TypeScript
- MobX (State Management)
- SignalR Client
- Tailwind CSS
- Jest + React Testing Library

## Frontend Architecture

```
src/
├── models/                         # Data models
│   ├── Notification.ts            # Base notification model
│   ├── NotificationFilter.ts      # Filter models
│   └── index.ts
├── services/                      # Services
│   ├── contracts/                 # Service interfaces
│   │   ├── INotificationService.ts
│   │   └── ISignalRNotificationService.ts
│   └── mocks/                     # Mock implementations
├── stores/                        # MobX stores
├── NotificationsBar/              # Main components
│   ├── NotificationBell.tsx       # Notification icon
│   ├── NotificationCenterWithStore.tsx  # Notification center
│   ├── NotificationFilters.tsx    # Filters
│   ├── NotificationSettings.tsx   # Settings
│   ├── Toast/                     # Toast notifications
│   │   ├── ToastContainer.tsx
│   │   ├── ToastProvider.tsx
│   │   └── ToastNotification.tsx
│   └── ToastSettings/             # Toast settings
├── hooks/                         # React hooks
│   └── useNotificationFilters.ts  # Filtering hook
└── utils/                         # Utilities
    └── notificationUtils.ts
```

## Data Models

### BaseNotification

Base notification model with flexible typing.

**File:** `src/models/Notification.ts`

```typescript
export interface BaseNotification {
  // Required fields
  id: number | string;
  type: string;
  title: string;
  content: string;
  date: string;
  read: boolean;

  // Optional fields
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
}
```

**Properties:**
- `id` — unique identifier
- `type` — notification type (arbitrary string)
- `title` — title
- `content` — main content
- `date` — creation date (ISO 8601)
- `read` — read status
- `author` — notification author (optional)
- `actions` — available actions (optional)
- `hashtags` — tags for categorization (optional)
- `parameters` — additional metadata (optional)

### NotificationParameter

Additional notification metadata.

```typescript
export interface NotificationParameter {
  key: string;
  value: string;
  description: string;
}
```

## Components

### NotificationBell

Notification icon component that shows the number of unread notifications.

**Features:**
- Displays unread notification count
- Shows red badge for new notifications
- Opens notification center on click
- Customizable icon and styling

**Usage:**
```typescript
<NotificationBell 
  unreadCount={5}
  onClick={handleOpenCenter}
/>
```

### NotificationCenterWithStore

Main notification center component with integrated MobX store.

**Features:**
- Displays list of notifications
- Filter by type and read status
- Mark as read/unread
- Delete notifications
- Real-time updates via SignalR

**Usage:**
```typescript
<NotificationCenterWithStore
  signalRUrl="http://localhost:5093/notificationHub"
  apiBaseUrl="http://localhost:5093/api"
  userId="user-guid"
/>
```

### NotificationFilters

Filter component for notifications.

**Features:**
- Filter by notification type
- Filter by read/unread status
- Filter by date range
- Custom filter combinations

### Toast Notifications

Toast notification system for real-time alerts.

**Components:**
- `ToastProvider` — Context provider for toast system
- `ToastContainer` — Container for displaying toasts
- `ToastNotification` — Individual toast component

**Usage:**
```typescript
<ToastProvider>
  <App />
  <ToastContainer />
</ToastProvider>

// Show toast
showToast({
  title: "New Order",
  message: "Order #12345 has been placed",
  type: "success"
});
```

## Services

### INotificationService

Interface for notification data operations.

**Methods:**
```typescript
interface INotificationService {
  getNotifications(userId: string): Promise<BaseNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
}
```

### ISignalRNotificationService

Interface for real-time SignalR communication.

**Methods:**
```typescript
interface ISignalRNotificationService {
  connect(hubUrl: string, token?: string): Promise<void>;
  disconnect(): Promise<void>;
  onNotificationReceived(callback: (notification: BaseNotification) => void): void;
}
```

## MobX Store

### NotificationStore

Central store for managing notification state.

**Features:**
- Manages notification list
- Handles filtering and sorting
- Integrates with SignalR for real-time updates
- Manages read/unread status

**Observable Properties:**
```typescript
@observable notifications: BaseNotification[] = [];
@observable unreadCount: number = 0;
@observable filter: NotificationFilter = {};
```

**Actions:**
```typescript
@action loadNotifications()
@action markAsRead(id: string)
@action addNotification(notification: BaseNotification)
@action deleteNotification(id: string)
```

## Integration

### Basic Setup

```typescript
import { NotificationCenterWithStore } from 'sed-notifications-frontend';

function App() {
  return (
    <NotificationCenterWithStore
      signalRUrl="http://localhost:5093/notificationHub"
      apiBaseUrl="http://localhost:5093/api"
      userId="your-user-id"
    />
  );
}
```

### With Authentication

```typescript
import { NotificationCenterWithStore } from 'sed-notifications-frontend';

function App() {
  const jwtToken = getAuthToken(); // Your auth function

  return (
    <NotificationCenterWithStore
      signalRUrl="http://localhost:5093/notificationHub"
      apiBaseUrl="http://localhost:5093/api"
      userId="your-user-id"
      accessToken={jwtToken}
    />
  );
}
```

### Custom Styling

The component uses Tailwind CSS and supports custom styling through className props.

```typescript
<NotificationCenterWithStore
  className="custom-notification-center"
  bellClassName="custom-bell"
  // ... other props
/>
```

## Testing

### Unit Tests

```bash
npm test
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';

test('displays unread count', () => {
  render(<NotificationBell unreadCount={5} />);
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

## Next Steps

1. Review [API Documentation](./04-API.md) for backend integration
2. Check [Developer Guide](./06-Development-Guide.md) for customization
3. See [Integration Guide](./07-Integration-Guide.md) for deployment

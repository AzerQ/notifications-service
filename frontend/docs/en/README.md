# InApp Notification Component MVP

A clean, simple, and production-ready React notification component with SignalR real-time updates.

## 🎯 Features

- ✅ **Simple Bell Icon** with unread count badge
- ✅ **Dropdown Notification List** with recent notifications
- ✅ **Mark as Read/Unread** individual notifications
- ✅ **Mark All as Read** functionality
- ✅ **Filter Unread** notifications
- ✅ **Real-time Updates** via SignalR
- ✅ **Backend Icon Support** with fallback to default
- ✅ **Time-ago Formatting** for notification dates
- ✅ **Click to Open URLs** from notifications
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **TypeScript** fully typed
- ✅ **MobX** for state management
- ✅ **Route Preferences** - enable/disable notifications by route
- ✅ **Settings Modal** with toggle switches for notification types
- ✅ **Zero Bugs** clean implementation
- ✅ **Public API** for host applications (`window.NotificationWidget`)
- ✅ **Action Buttons** with `appaction://` protocol support
- ✅ **Infinite Scroll** for large notification lists
- ✅ **Client-side Search** and filtering
- ✅ **Connection Status** indicator (SignalR)

## 📦 Installation

```bash
npm install
```

## 🚀 Development

```bash
npm run dev
```

Opens on http://localhost:3001

## 🏗️ Build

Build as library:
```bash
npm run build:lib
```

Regular build:
```bash
npm run build
```

## 📖 Usage

### Basic Example

The component is configured via environment variables (`.env`) and handles its own state and authentication.

```tsx
import { NotificationComponent } from '@notifications-service/inapp-component-mvp';

function App() {
  return (
    <NotificationComponent
      onNotificationClick={(notification) => {
        console.log('Clicked:', notification);
      }}
      showPreferencesButton={true}
    />
  );
}
```

### Advanced Example with Custom Styling

```tsx
import { NotificationBell, NotificationDropdown, useNotificationStore } from '@notifications-service/inapp-component-mvp';

function CustomNotifications() {
  const store = useNotificationStore(config);

  return (
    <div className="relative">
      <NotificationBell 
        store={store}
        className="custom-bell-styles"
      />
      
      <NotificationDropdown 
        store={store}
        maxHeight="500px"
        onNotificationClick={(n) => {
          // Custom handling
          window.location.href = n.url;
        }}
      />
    </div>
  );
}
```

## 🔌 Public API (Integration)

When embedded as a module, the widget exposes a global API via `window.NotificationWidget`.

### Methods

- `refresh(): Promise<void>` - Force reload notifications from the server.
- `open(): void` - Programmatically open the dropdown.
- `close(): void` - Programmatically close the dropdown.
- `setToken(token: string): void` - Update the JWT token dynamically.
- `registerActionHandler(name: string, handler: (args: Record<string, string>) => void): void` - Register a handler for `appaction://` URLs.

### Example: Handling Custom Actions

1. **Backend** sends a notification with an action URL: `appaction://openTask?taskId=456`.
2. **Host App** registers a handler:

```javascript
window.NotificationWidget.registerActionHandler('openTask', (args) => {
  console.log('Opening task:', args.taskId);
  // Your custom logic here
});
```

## 🏛️ Architecture

### Components

- **NotificationComponent** - Main wrapper component
- **NotificationBell** - Bell icon with badge
- **NotificationDropdown** - Dropdown list
- **NotificationItem** - Individual notification item

### Store (MobX)

- **NotificationStore** - Centralized state management
  - Notifications array
  - Loading states
  - SignalR connection state
  - Computed values (unread count, etc.)

### Services

- **NotificationApiClient** - Axios-based API client
- **SignalRNotificationService** - SignalR connection manager

### Hooks

- **useNotificationStore** - Hook to create and manage store instance

## 🎨 Styling

The component uses Tailwind CSS for styling. All styles are self-contained and won't conflict with your application styles.

## 📋 API Reference

### NotificationComponent Props

```typescript
interface NotificationComponentProps {
  store: NotificationStore;
  onNotificationClick?: (notification: Notification) => void;
  bellClassName?: string;
  position?: 'left' | 'right';
  showPreferencesButton?: boolean; // Show settings button for route preferences
}
```

### NotificationStore Methods

```typescript
class NotificationStore {
  // Methods
  loadNotifications(): Promise<void>
  markAsRead(id: string): Promise<void>
  markAsUnread(id: string): Promise<void>
  markAllAsRead(): Promise<void>
  setFilters(filters: NotificationFilters): void
  clearFilters(): void
  reload(): Promise<void>
  dispose(): void
  
  // Computed
  get unreadCount(): number
  get unreadNotifications(): Notification[]
  get hasUnread(): boolean
}
```

### Notification Type

```typescript
interface Notification {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  read: boolean;
  receiverId: string;
  icon?: NotificationIcon;
  url?: string;
  metadata?: Record<string, unknown>;
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5093
VITE_SIGNALR_URL=http://localhost:5093/notificationHub
VITE_ENABLED_AUTH_METHODS=windows,email
```

## Testing

```bash
npm test
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **MobX 6** - State management
- **SignalR Client** - Real-time updates
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Vitest** - Testing framework

## 📝 Backend API Requirements

The component expects these endpoints:

```
GET  /api/notification/personal?pageNumber=1&pageSize=50&onlyUnread=false
PUT  /api/notification/{id}/read
PUT  /api/notification/personal/mark-all-read
GET  /api/user-route-preferences
PUT  /api/user-route-preferences
WS   /notificationHub (SignalR)
```

SignalR event: `ReceiveNotification`

### Route Preferences API

The component supports user notification preferences:

**GET /api/users/{userId}/routes**
```json
[
  {
    "id": "8dd481d0-e062-4fad-b1ff-7d07d2e2e721",
    "userId": "9490fae9-2a4c-4545-8025-7dd3bf8397ec",
    "route": "UserRegistered",
    "enabled": false,
    "routeDisplayName": "Регистрация пользователя",
    "routeDescription": "Уведомление отправляется при регистрации нового пользователя"
  }
]
```

**PUT /api/users/{userId}/routes**
```json
[
  {
    "route": "UserRegistered",
    "enabled": true,
    "id": "8dd481d0-e062-4fad-b1ff-7d07d2e2e721"
  }
]
```

**Note**: User ID is automatically extracted from JWT token on the backend, so the frontend doesn't need to pass it explicitly.

## 🎯 Design Principles

- **KISS** - Keep It Simple, Stupid
- **Single Responsibility** - Each component does one thing well
- **Clean Code** - Easy to read and maintain
- **Type Safety** - Full TypeScript coverage
- **No Over-Engineering** - Only essential features

## 📄 License

MIT

## 🤝 Contributing

This is an MVP component. Contributions welcome!

## 📞 Support

For issues or questions, please open a GitHub issue.

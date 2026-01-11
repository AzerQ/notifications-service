# Integration Guide

This document describes how to integrate the Notification Component into your host application and use its Public API.

## 1. Embedding the Component

### As a React Component
If your application is built with React, you can import and use the component directly:

```tsx
import { NotificationComponent, useNotificationStore } from '@notifications-service/inapp-component-mvp';

const store = useNotificationStore({
  apiBaseUrl: 'https://api.your-service.com',
  signalRHubUrl: 'https://api.your-service.com/notificationHub'
});

// Render inside your layout
<NotificationComponent />
```

### As a Standalone Module (Shadow DOM)
The component is designed to be isolated. When built as a library, it can be injected into any page.

## 2. Public API (`window.NotificationWidget`)

Once the component is mounted, it exports a global object to `window.NotificationWidget`. This allows non-React applications to interact with the widget.

### API Interface

```typescript
interface NotificationWidget {
  refresh(): Promise<void>;
  open(): void;
  close(): void;
  registerActionHandler(name: string, handler: (args: Record<string, string>) => void): void;
}
```

### Examples

#### Updating the Token
When your host application refreshes its JWT token, you must notify the widget:
```javascript
window.NotificationWidget.setToken('new-jwt-token');
```

#### Programmatic Control
```javascript
// Open the notification list
window.NotificationWidget.open();

// Force refresh
window.NotificationWidget.refresh();
```

## 3. Custom Action Buttons (`appaction://`)

The widget supports interactive buttons within notifications. These buttons use a custom protocol `appaction://`.

### How it works
1. The backend sends a notification with an action URL, e.g., `appaction://approveDocument?docId=789&version=1`.
2. The widget renders a button.
3. When clicked, the widget parses the URL and calls the registered handler.

### Registering a Handler
In your host application (e.g., Docsvision), register the handler:

```javascript
window.NotificationWidget.registerActionHandler('approveDocument', (args) => {
  const { docId, version } = args;
  console.log(`Approving document ${docId} v${version}`);
  
  // Perform your business logic here
  myApp.approve(docId);
});
```

## 4. Styling and Isolation

The component uses **CSS Modules** and is typically rendered inside a **Shadow DOM** (if using the wrapper). This ensures that:
- Host application styles do not break the widget.
- Widget styles do not affect the host application.

## 5. TypeScript Support

For full type safety in your project, you can include the declaration file:
```typescript
/// <reference path="path/to/notification-widget.d.ts" />
```

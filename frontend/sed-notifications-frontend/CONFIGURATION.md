# InApp Notification Component Configuration Guide

## Overview

The InApp notification component has been migrated from mock mode to real production mode. All configuration is now managed through environment variables in the `.env` file.

## Environment Variables

### Core Configuration

#### `REACT_APP_NOTIFICATION_MODE`
- **Type**: `'mock' | 'real'`
- **Default**: `'real'`
- **Description**: Determines whether the application uses mock services or real API services
- **Example**: `REACT_APP_NOTIFICATION_MODE=real`

### API Configuration

#### `REACT_APP_API_BASE_URL`
- **Type**: `string`
- **Default**: `http://localhost:5000`
- **Description**: Base URL for the notification API backend
- **Example**: `REACT_APP_API_BASE_URL=https://api.example.com`

#### `REACT_APP_API_TIMEOUT`
- **Type**: `number` (milliseconds)
- **Default**: `30000`
- **Description**: Request timeout for API calls
- **Example**: `REACT_APP_API_TIMEOUT=30000`

### SignalR Configuration

#### `REACT_APP_SIGNALR_HUB_URL`
- **Type**: `string`
- **Default**: `http://localhost:5000/notificationHub`
- **Description**: URL of the SignalR hub for real-time notifications
- **Example**: `REACT_APP_SIGNALR_HUB_URL=https://api.example.com/notificationHub`

#### `REACT_APP_SIGNALR_RECONNECT_INTERVAL`
- **Type**: `number` (milliseconds)
- **Default**: `5000`
- **Description**: Interval between reconnection attempts
- **Example**: `REACT_APP_SIGNALR_RECONNECT_INTERVAL=5000`

#### `REACT_APP_SIGNALR_MAX_RECONNECT_ATTEMPTS`
- **Type**: `number`
- **Default**: `10`
- **Description**: Maximum number of reconnection attempts before giving up
- **Example**: `REACT_APP_SIGNALR_MAX_RECONNECT_ATTEMPTS=10`

### Feature Flags

#### `REACT_APP_ENABLE_TOAST_NOTIFICATIONS`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable/disable toast notifications
- **Example**: `REACT_APP_ENABLE_TOAST_NOTIFICATIONS=true`

#### `REACT_APP_ENABLE_SIGNALR`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable/disable SignalR real-time notifications
- **Example**: `REACT_APP_ENABLE_SIGNALR=true`

#### `REACT_APP_ENABLE_AUTO_REFRESH`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable/disable automatic refresh of notifications
- **Example**: `REACT_APP_ENABLE_AUTO_REFRESH=true`

#### `REACT_APP_AUTO_REFRESH_INTERVAL`
- **Type**: `number` (milliseconds)
- **Default**: `30000`
- **Description**: Interval for automatic notification refresh
- **Example**: `REACT_APP_AUTO_REFRESH_INTERVAL=30000`

### Debugging

#### `REACT_APP_DEBUG_MODE`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable debug logging in the console
- **Example**: `REACT_APP_DEBUG_MODE=true`

## Configuration Examples

### Development Environment (Mock Mode)

```env
REACT_APP_NOTIFICATION_MODE=mock
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_SIGNALR_HUB_URL=http://localhost:5000/notificationHub
REACT_APP_DEBUG_MODE=true
```

### Production Environment (Real Mode)

```env
REACT_APP_NOTIFICATION_MODE=real
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_SIGNALR_HUB_URL=https://api.example.com/notificationHub
REACT_APP_SIGNALR_RECONNECT_INTERVAL=5000
REACT_APP_SIGNALR_MAX_RECONNECT_ATTEMPTS=10
REACT_APP_ENABLE_TOAST_NOTIFICATIONS=true
REACT_APP_ENABLE_SIGNALR=true
REACT_APP_ENABLE_AUTO_REFRESH=true
REACT_APP_AUTO_REFRESH_INTERVAL=30000
REACT_APP_DEBUG_MODE=false
```

### Staging Environment (Real Mode with Debug)

```env
REACT_APP_NOTIFICATION_MODE=real
REACT_APP_API_BASE_URL=https://staging-api.example.com
REACT_APP_SIGNALR_HUB_URL=https://staging-api.example.com/notificationHub
REACT_APP_DEBUG_MODE=true
```

## Service Architecture

### Real Services

When `REACT_APP_NOTIFICATION_MODE=real`, the application uses:

1. **NotificationService** (`src/services/NotificationService.ts`)
   - Communicates with the backend API
   - Handles notification fetching, marking as read, and settings management
   - Uses the ApiClient for HTTP requests

2. **SignalRNotificationService** (`src/services/SignalRNotificationService.ts`)
   - Establishes real-time connection via SignalR
   - Handles incoming notifications and status updates
   - Implements automatic reconnection logic

### Mock Services

When `REACT_APP_NOTIFICATION_MODE=mock`, the application uses:

1. **MockNotificationService** (`src/services/mocks/MockNotificationService.ts`)
   - Simulates API responses with mock data
   - Useful for development and testing

2. **MockSignalRNotificationService** (`src/services/mocks/MockSignalRNotificationService.ts`)
   - Simulates real-time notifications
   - Generates random notifications for testing

## Configuration Loading

The configuration is loaded at application startup through the `loadServiceConfig()` function in `src/config/serviceConfig.ts`. This function:

1. Reads all environment variables
2. Validates and provides defaults
3. Creates appropriate service instances based on the mode
4. Logs configuration in debug mode

## API Endpoints

The NotificationService expects the following API endpoints:

- `GET /api/notifications/unread` - Get unread notifications
- `GET /api/notifications/all` - Get all notifications
- `POST /api/notifications/{id}/mark-as-read` - Mark notification as read
- `POST /api/notifications/mark-multiple-as-read` - Mark multiple as read
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/settings` - Get user settings
- `POST /api/notifications/settings` - Save user settings
- `GET /api/notifications/toast-settings` - Get toast settings
- `POST /api/notifications/toast-settings` - Save toast settings

## SignalR Hub Events

The SignalRNotificationService expects the following hub events:

- `ReceiveNotification` - New notification received
- `NotificationStatusUpdated` - Notification status changed

## Authentication

The ApiClient automatically includes the access token from localStorage in the Authorization header:

```
Authorization: Bearer {accessToken}
```

Token refresh is handled automatically through interceptors.

## Troubleshooting

### SignalR Connection Issues

1. Check that `REACT_APP_SIGNALR_HUB_URL` is correct
2. Verify the backend SignalR hub is running
3. Check browser console for connection errors
4. Enable `REACT_APP_DEBUG_MODE=true` for detailed logs

### API Connection Issues

1. Verify `REACT_APP_API_BASE_URL` is correct
2. Check that the backend API is running
3. Verify CORS configuration on the backend
4. Check authentication tokens in localStorage

### Configuration Not Loading

1. Ensure `.env` file exists in the project root
2. Restart the development server after changing `.env`
3. Check that variable names are correct (case-sensitive)
4. Verify no spaces around `=` in `.env` file

## Migration from Mock to Real Mode

To switch from mock mode to real mode:

1. Update `.env` file:
   ```env
   REACT_APP_NOTIFICATION_MODE=real
   REACT_APP_API_BASE_URL=your-api-url
   REACT_APP_SIGNALR_HUB_URL=your-signalr-url
   ```

2. Restart the development server

3. Verify in the UI that the mode shows "Реальный" (Real)

4. Check browser console for any errors

## Files Modified

- `.env` - Environment configuration
- `src/config/serviceConfig.ts` - Configuration loading and service factory
- `src/services/NotificationService.ts` - Real notification service
- `src/services/SignalRNotificationService.ts` - Real SignalR service
- `src/store/NotificationStoreContext.tsx` - Updated to use configuration
- `src/App.tsx` - Updated to display configuration status
- `src/services/index.ts` - Exports for new services

# Services

This directory contains service classes for interacting with the Notification Service API.

## ApiClient

The `ApiClient` class provides a comprehensive axios-based HTTP client with automatic authentication handling.

### Features

- **Automatic Token Refresh**: Automatically refreshes access tokens using refresh tokens
- **Multi-level Authentication Fallback**:
  1. Try to refresh using refresh token
  2. If refresh fails, try Windows authentication
  3. If Windows auth fails, trigger callback for email authentication
- **Request Queueing**: Queues failed requests during token refresh and retries them
- **Token Management**: Handles storing and retrieving tokens from localStorage

### Usage Example

```typescript
import { createApiClient, ApiClient } from './services';

// Create API client with callback for unauthenticated state
const apiClient = createApiClient({
  baseUrl: 'http://localhost:5093',
  onUnauthenticated: () => {
    // Redirect to login page or show login modal
    window.location.href = '/login';
  }
});

// Use the axios instance for API calls
const response = await apiClient.instance.get('/api/notification/personal');

// Email authentication
const challenge = await apiClient.sendEmailCode('user@example.com');
const tokens = await apiClient.loginByEmail(challenge.id, '123456');

// Check authentication status
if (apiClient.isAuthenticated()) {
  console.log('User is authenticated');
}

// Clear tokens on logout
apiClient.clearTokens();
```

### Authentication Flow

1. **Initial Request**: User makes an API request with access token in Authorization header
2. **Token Expired (401)**: If access token is expired, interceptor catches 401 error
3. **Refresh Token**: Attempts to refresh access token using refresh token from localStorage
4. **Windows Auth**: If refresh fails, attempts Windows authentication (with credentials)
5. **Email Auth**: If Windows auth fails, calls `onUnauthenticated` callback for manual login
6. **Retry**: After successful authentication, retries the original failed request

## AuthService

A simpler authentication service without axios interceptor (legacy support).

### Usage Example

```typescript
import { AuthService } from './services';

const authService = new AuthService('http://localhost:5093/api/auth');

// Check if authenticated
if (authService.isAuthenticated()) {
  const token = authService.getAccessToken();
  // Use token for API calls
}

// Refresh token manually
const newTokens = await authService.refreshToken();
if (newTokens) {
  authService.setTokens(newTokens);
}
```

## Mock Services

Mock implementations for testing and development:

- `MockNotificationService`: Mock notification CRUD operations
- `MockSignalRNotificationService`: Mock SignalR real-time notifications

These are used in tests and can be used for development without a backend.

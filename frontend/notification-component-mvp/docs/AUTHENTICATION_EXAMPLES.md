# Authentication Examples

## Example 1: Simple React App with Auto-Authentication

```typescript
import React from 'react';
import { useNotificationStore, EmailCodeModal } from '@notifications-service/inapp-component-mvp';

function App() {
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');

  const { store, authentication } = useNotificationStore({
    apiBaseUrl: 'https://api.example.com',
    signalRHubUrl: 'https://api.example.com/notificationHub',
    userId: 'current-user-id',
    onEmailCodeRequired: (email, challengeId) => {
      setUserEmail(email);
setShowEmailModal(true);
    }
  });

  return (
 <>
      <div>
        Auth Status: {authentication.authState.isAuthenticated ? '? Authenticated' : '? Not Authenticated'}
      </div>
   
      <EmailCodeModal
        isOpen={showEmailModal}
        challengeId={authentication.authState.emailChallengeId || ''}
        email={userEmail}
 isVerifying={authentication.authState.isAuthenticating}
      error={authentication.authState.error}
        onVerify={async (verification) => {
          await authentication.verifyEmailCode(verification);
      setShowEmailModal(false);
        }}
        onResendCode={(email) => authentication.sendEmailCode(email)}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  );
}
```

## Example 2: Manual Authentication Control

```typescript
import { useAuthentication } from '@notifications-service/inapp-component-mvp';

function LoginComponent() {
  const { authState, authenticate, sendEmailCode, verifyEmailCode, logout } = useAuthentication({
    apiBaseUrl: 'https://api.example.com',
    autoAuthenticate: false, // Disable auto-authentication
  });

  const handleLogin = async () => {
    // Manually trigger authentication
  const tokens = await authenticate();
    
    if (!tokens && authState.requiresEmailCode) {
      // Need to show email code form
      const email = prompt('Enter your email:');
      if (email) {
        const challenge = await sendEmailCode(email);
  const code = prompt('Enter verification code:');
        if (code) {
      await verifyEmailCode({ id: challenge.challengeId, code });
 }
      }
    }
  };

  return (
    <div>
      {authState.isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
     <button onClick={handleLogin} disabled={authState.isAuthenticating}>
          {authState.isAuthenticating ? 'Authenticating...' : 'Login'}
        </button>
      )}
 </div>
  );
}
```

## Example 3: Using AuthenticationService Directly

```typescript
import { createAuthenticationService } from '@notifications-service/inapp-component-mvp';

const authService = createAuthenticationService({
  apiBaseUrl: 'https://api.example.com',
  onAuthSuccess: (tokens) => {
    console.log('Authentication successful!');
    // Store tokens or update UI
  },
  onAuthFailure: (error) => {
    console.error('Authentication failed:', error);
  },
  onEmailCodeRequired: async (email, challengeId) => {
    // Show custom email code UI
    const code = await getCodeFromUser(email);
    await authService.verifyEmailCode({ id: challengeId, code });
  }
});

// Manually authenticate
const tokens = await authService.authenticate();

// Check authentication status
if (authService.isAuthenticated()) {
  console.log('User is authenticated');
}

// Logout
authService.logout();
```

## Example 4: Custom Email Code Modal

```typescript
import React from 'react';

function CustomEmailCodeModal({ onVerify, onClose }) {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
    try {
      await onVerify(code);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal">
    <h2>Enter Verification Code</h2>
    <form onSubmit={handleSubmit}>
        <input
          type="text"
  value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
  />
        {error && <p className="error">{error}</p>}
        <button type="submit">Verify</button>
        <button type="button" onClick={onClose}>Cancel</button>
    </form>
    </div>
  );
}

// Usage
function App() {
  const { authentication } = useNotificationStore(config);
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      {showModal && (
        <CustomEmailCodeModal
   onVerify={async (code) => {
            await authentication.verifyEmailCode({
           id: authentication.authState.emailChallengeId!,
        code
         });
          }}
     onClose={() => setShowModal(false)}
/>
      )}
    </>
  );
}
```

## Example 5: Monitoring Authentication State

```typescript
import { useEffect } from 'react';
import { useAuthentication } from '@notifications-service/inapp-component-mvp';

function AuthMonitor() {
  const { authState, authenticate } = useAuthentication({
  apiBaseUrl: 'https://api.example.com',
    autoAuthenticate: true,
  });

  // Monitor authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', authState);
    
    if (authState.error) {
      // Log to error tracking service
      trackError('Authentication Error', authState.error);
    }
    
    if (authState.isAuthenticated) {
 // Update analytics
      trackEvent('User Authenticated');
    }
  }, [authState]);

  // Periodically check authentication
  useEffect(() => {
    const interval = setInterval(() => {
      if (!authState.isAuthenticated && !authState.isAuthenticating) {
        console.log('Re-attempting authentication...');
        authenticate();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.isAuthenticating]);

  return (
    <div>
      <h3>Authentication Monitor</h3>
      <pre>{JSON.stringify(authState, null, 2)}</pre>
    </div>
  );
}
```

## Example 6: Integration with Redux

```typescript
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthentication } from '@notifications-service/inapp-component-mvp';

// Redux actions
const setAuthTokens = (tokens) => ({ type: 'SET_AUTH_TOKENS', payload: tokens });
const setAuthError = (error) => ({ type: 'SET_AUTH_ERROR', payload: error });

function App() {
  const dispatch = useDispatch();
  const showEmailModal = useSelector(state => state.auth.showEmailModal);

  const { authState, authentication } = useAuthentication({
    apiBaseUrl: 'https://api.example.com',
    onAuthSuccess: (tokens) => {
      dispatch(setAuthTokens(tokens));
    },
    onAuthFailure: (error) => {
      dispatch(setAuthError(error));
    },
    onEmailCodeRequired: () => {
      dispatch({ type: 'SHOW_EMAIL_MODAL' });
    }
  });

  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

## Example 7: Testing Authentication Flow

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthentication } from '@notifications-service/inapp-component-mvp';

describe('Authentication Flow', () => {
  it('should authenticate automatically on mount', async () => {
    const onAuthSuccess = jest.fn();
    
    const { result } = renderHook(() =>
      useAuthentication({
        apiBaseUrl: 'http://localhost:5093',
        autoAuthenticate: true,
        onAuthSuccess
      })
    );

    // Wait for authentication to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    expect(result.current.authState.isAuthenticated).toBe(true);
    expect(onAuthSuccess).toHaveBeenCalled();
  });

  it('should require email code when refresh and Windows fail', async () => {
    const onEmailCodeRequired = jest.fn();
    
    const { result } = renderHook(() =>
      useAuthentication({
        apiBaseUrl: 'http://localhost:5093',
 autoAuthenticate: false,
        onEmailCodeRequired
      })
    );

    await act(async () => {
      await result.current.authenticate();
    });

    expect(onEmailCodeRequired).toHaveBeenCalled();
    expect(result.current.authState.requiresEmailCode).toBe(true);
  });
});
```

## Example 8: Environment-specific Configuration

```typescript
// config/auth.ts
export const getAuthConfig = (env: 'development' | 'staging' | 'production') => {
  const configs = {
    development: {
    apiBaseUrl: 'http://localhost:5093',
      signalRHubUrl: 'http://localhost:5093/notificationHub',
    },
    staging: {
      apiBaseUrl: 'https://staging-api.example.com',
      signalRHubUrl: 'https://staging-api.example.com/notificationHub',
    },
    production: {
      apiBaseUrl: 'https://api.example.com',
      signalRHubUrl: 'https://api.example.com/notificationHub',
    }
  };

  return configs[env];
};

// App.tsx
import { getAuthConfig } from './config/auth';

const config = getAuthConfig(process.env.NODE_ENV as any);

const { store, authentication } = useNotificationStore({
  ...config,
  userId: currentUser.id,
  onEmailCodeRequired: handleEmailCodeRequired
});
```

## Example 9: Error Handling and Retry

```typescript
function RobustAuthComponent() {
  const [retryCount, setRetryCount] = React.useState(0);
  const MAX_RETRIES = 3;

  const { authState, authenticate } = useAuthentication({
    apiBaseUrl: 'https://api.example.com',
    autoAuthenticate: true,
    onAuthFailure: async (error) => {
      console.error('Authentication failed:', error);
      
      if (retryCount < MAX_RETRIES) {
    console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
      
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        await authenticate();
      } else {
        console.error('Max retries reached');
        // Show error message to user
   }
    }
  });

  return (
    <div>
      {authState.error && retryCount >= MAX_RETRIES && (
        <div className="error">
          Authentication failed after {MAX_RETRIES} attempts. Please try again later.
        </div>
      )}
    </div>
  );
}
```

## Example 10: Multi-tenancy Support

```typescript
function MultiTenantApp() {
  const [currentTenant, setCurrentTenant] = React.useState<string>('tenant1');
  
  const config = React.useMemo(() => ({
    apiBaseUrl: `https://${currentTenant}.api.example.com`,
signalRHubUrl: `https://${currentTenant}.api.example.com/notificationHub`,
    userId: getCurrentUserId(),
  }), [currentTenant]);

  const { store, authentication } = useNotificationStore(config);

  const switchTenant = async (newTenant: string) => {
    // Logout from current tenant
    authentication.logout();
    
    // Switch tenant
    setCurrentTenant(newTenant);
    
    // Re-authenticate with new tenant
    await authentication.authenticate();
  };

  return (
    <div>
      <select value={currentTenant} onChange={(e) => switchTenant(e.target.value)}>
 <option value="tenant1">Tenant 1</option>
      <option value="tenant2">Tenant 2</option>
      </select>
    </div>
  );
}
```

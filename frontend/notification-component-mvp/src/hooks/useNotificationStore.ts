import { useState, useEffect } from 'react';
import { NotificationStore } from '../store/NotificationStore';
import { createNotificationApiClient } from '../services/apiClient';
import { createSignalRService } from '../services/signalRService';
import { useAuthentication } from './useAuthentication';
import type { NotificationComponentConfig } from '../types';

/**
 * Hook to create and manage notification store with automatic authentication
 */
export function useNotificationStore(config: NotificationComponentConfig) {
  const [isStoreInitialized, setIsStoreInitialized] = useState(false);

  // Setup authentication with auto-authentication enabled
  const authentication = useAuthentication({
    apiBaseUrl: config.apiBaseUrl,
    autoAuthenticate: true,
    userEmail: config.userEmail, // Передаем email если доступен
    onAuthSuccess: async (tokens) => {
      console.log('[NotificationStore] Authentication successful');

      // Update API client and SignalR with new token
      if (store) {
        store['apiClient'].setAccessToken(tokens.accessToken);
        store['signalRService'].updateAccessToken(tokens.accessToken);

        // Initialize store after authentication
        if (!isStoreInitialized) {
          console.log('[NotificationStore] Initializing store after authentication');
          await store.initialize();
          setIsStoreInitialized(true);
        } else {
          // Reload notifications after re-authentication
          console.log('[NotificationStore] Reloading after re-authentication');
          await store.reload();
        }
      }
    },
    onAuthFailure: (error) => {
      console.warn('[NotificationStore] Authentication failed:', error);
    },
    onEmailCodeRequired: (email, challengeId) => {
      console.log('[NotificationStore] Email code required for:', email);
      config.onEmailCodeRequired?.(email, challengeId);
    },
  });

  // Create store with authentication service
  const [store] = useState(() => {
    const apiClient = createNotificationApiClient(
      config.apiBaseUrl,
      config.accessToken,
      authentication.authService // Pass auth service for automatic re-auth
    );

    const signalRService = createSignalRService({
      hubUrl: config.signalRHubUrl,
      accessToken: config.accessToken,
      autoReconnect: true,
    });

    return new NotificationStore(apiClient, signalRService);
  });

  // Update access token when it changes from external source
  useEffect(() => {
    if (config.accessToken) {
      store['apiClient'].setAccessToken(config.accessToken);
      store['signalRService'].updateAccessToken(config.accessToken);
    }
  }, [config.accessToken, store]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, [store]);

  // Handle logout - reset store
  const originalLogout = authentication.logout;
  authentication.logout = () => {
    console.log('[NotificationStore] Logging out, resetting store');
    store.reset();
    setIsStoreInitialized(false);
    originalLogout();
  };

  return {
    store,
    authentication,
    isStoreInitialized,
  };
}

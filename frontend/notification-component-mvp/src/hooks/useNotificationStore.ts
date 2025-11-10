import { useState, useEffect } from 'react';
import { NotificationStore } from '../store/NotificationStore';
import { createNotificationApiClient } from '../services/apiClient';
import { createSignalRService } from '../services/signalRService';
import type { NotificationComponentConfig } from '../types';

/**
 * Hook to create and manage notification store
 */
export function useNotificationStore(config: NotificationComponentConfig): NotificationStore {
  const [store] = useState(() => {
    const apiClient = createNotificationApiClient(
      config.apiBaseUrl, 
      config.accessToken
    );
    
    const signalRService = createSignalRService({
      hubUrl: config.signalRHubUrl,
      accessToken: config.accessToken,
      autoReconnect: true
    });

    return new NotificationStore(apiClient, signalRService);
  });

  // Update access token when it changes
  useEffect(() => {
    if (config.accessToken) {
      store['apiClient'].setAccessToken(config.accessToken);
      store['signalRService'].updateAccessToken(config.accessToken);
    }
  }, [config.accessToken, store]);

  return store;
}

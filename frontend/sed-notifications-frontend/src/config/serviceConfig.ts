import { INotificationService } from '../services/contracts/INotificationService';
import { ISignalRNotificationService } from '../services/contracts/ISignalRNotificationService';
import { NotificationService } from '../services/NotificationService';
import { SignalRNotificationService } from '../services/SignalRNotificationService';
import { MockNotificationService } from '../services/mocks/MockNotificationService';
import { MockSignalRNotificationService } from '../services/mocks/MockSignalRNotificationService';
import { ApiClient, createApiClient } from '../services/apiClient';

/**
 * Service configuration based on environment variables
 */
export interface ServiceConfig {
  mode: 'mock' | 'real';
  apiBaseUrl: string;
  signalRHubUrl: string;
  signalRReconnectInterval: number;
  signalRMaxReconnectAttempts: number;
  enableToastNotifications: boolean;
  enableSignalR: boolean;
  enableAutoRefresh: boolean;
  autoRefreshInterval: number;
  debugMode: boolean;
}

/**
 * Load configuration from environment variables
 */
export function loadServiceConfig(): ServiceConfig {
  return {
    mode: (process.env.REACT_APP_NOTIFICATION_MODE || 'mock') as 'mock' | 'real',
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
    signalRHubUrl: process.env.REACT_APP_SIGNALR_HUB_URL || 'http://localhost:5000/notificationHub',
    signalRReconnectInterval: parseInt(process.env.REACT_APP_SIGNALR_RECONNECT_INTERVAL || '5000', 10),
    signalRMaxReconnectAttempts: parseInt(process.env.REACT_APP_SIGNALR_MAX_RECONNECT_ATTEMPTS || '10', 10),
    enableToastNotifications: process.env.REACT_APP_ENABLE_TOAST_NOTIFICATIONS !== 'false',
    enableSignalR: process.env.REACT_APP_ENABLE_SIGNALR !== 'false',
    enableAutoRefresh: process.env.REACT_APP_ENABLE_AUTO_REFRESH !== 'false',
    autoRefreshInterval: parseInt(process.env.REACT_APP_AUTO_REFRESH_INTERVAL || '30000', 10),
    debugMode: process.env.REACT_APP_DEBUG_MODE === 'true'
  };
}

/**
 * Create notification service based on configuration
 */
export function createNotificationService(config: ServiceConfig): INotificationService {
  if (config.mode === 'mock') {
    return new MockNotificationService();
  }

  const apiClient = createApiClient({
    baseUrl: config.apiBaseUrl,
    onUnauthenticated: () => {
      // You can dispatch an action to show login modal here
    }
  });

  return new NotificationService(apiClient);
}

/**
 * Create SignalR service based on configuration
 */
export function createSignalRService(config: ServiceConfig): ISignalRNotificationService {
  if (config.debugMode) {
    console.log('[ServiceConfig] Creating SignalR service in', config.mode, 'mode');
  }

  if (config.mode === 'mock') {
    return new MockSignalRNotificationService();
  }

  return new SignalRNotificationService(
    config.signalRHubUrl,
    config.signalRReconnectInterval,
    config.signalRMaxReconnectAttempts
  );
}

/**
 * Create API client
 */
export function createApiClientInstance(config: ServiceConfig): ApiClient {
  return createApiClient({
    baseUrl: config.apiBaseUrl,
    onUnauthenticated: () => {
      console.warn('[ServiceConfig] User is not authenticated');
    }
  });
}

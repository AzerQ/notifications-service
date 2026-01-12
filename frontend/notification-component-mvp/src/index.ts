// Types
export type {
  Notification,
  NotificationIcon,
  PaginatedNotifications,
  NotificationFilters,
  GetNotificationsParams,
  SignalRConfig,
  UserRoutePreference,
  UserPreferenceDto,
  UserRoutePreferenceView
} from './types';

export const config: NotificationComponentConfig = {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5093',
    signalRHubUrl: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5093/notificationHub',
    iconsTheme: (import.meta.env.VITE_ICONS_THEME || 'light') as NotificationsIconsTheme,
    enabledAuthMethods: (import.meta.env.VITE_ENABLED_AUTH_METHODS?.split(',') as any) || ['windows', 'email'],
  };

export type NotificationsIconsTheme = 'light' | 'dark';

/**
 * Notification component configuration
 */
export interface NotificationComponentConfig {
  apiBaseUrl: string;
  signalRHubUrl: string;
  iconsTheme?: NotificationsIconsTheme;
  enabledAuthMethods?: Array<'windows' | 'email'>;
  onNotificationClick?: (notification: any) => void;
  onEmailCodeRequired?: (email: string, challengeId: string) => void;
  userEmail?: string;
}

// Components
export { NotificationComponent } from './components/NotificationComponent';
export { NotificationBell } from './components/NotificationBell';
export { NotificationDropdown } from './components/NotificationDropdown';
export { NotificationItem } from './components/NotificationItem';
export { Toast } from './components/Toast';
export { ToastContainer } from './components/ToastContainer';
export { RoutePreferencesModal } from './components/RoutePreferencesModal';

// Store
export { NotificationStore } from './store/NotificationStore';

// Services
export { NotificationApiClient, createNotificationApiClient } from './services/apiClient';
export { SignalRNotificationService, createSignalRService } from './services/signalRService';

// Hooks
export { useNotificationStore } from './hooks/useNotificationStore';
export { useRoutePreferences } from './hooks/useRoutePreferences';

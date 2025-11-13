// Types
export type {
  Notification,
  NotificationIcon,
  PaginatedNotifications,
  NotificationFilters,
  GetNotificationsParams,
  SignalRConfig,
  NotificationComponentConfig,
  UserRoutePreference,
  UserPreferenceDto,
  UserRoutePreferenceView
} from './types';

export const config = {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5093',
    signalRHubUrl: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5093/notificationHub',
    accessToken: import.meta.env.VITE_ACCESS_TOKEN,
  };

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

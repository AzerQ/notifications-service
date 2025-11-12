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

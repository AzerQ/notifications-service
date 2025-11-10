/**
 * Notification types aligned with backend API
 */

/**
 * Base notification model matching backend AppNotification
 */
export interface Notification {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  read: boolean;
  receiverId: string;
  icon?: NotificationIcon;
  url?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Icon configuration from backend
 */
export interface NotificationIcon {
  name: string;
  cssClass?: string;
}

/**
 * Paginated response from API
 */
export interface PaginatedNotifications {
  notifications: Notification[];
  totalItemsCount: number;
  request: {
    pageNumber: number;
    pageSize: number;
  };
}

/**
 * Notification filters for API
 */
export interface NotificationFilters {
  onlyUnread?: boolean;
  category?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * API request params
 */
export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  filters?: NotificationFilters;
}

/**
 * SignalR connection configuration
 */
export interface SignalRConfig {
  hubUrl: string;
  accessToken?: string;
  autoReconnect?: boolean;
}

/**
 * Notification component configuration
 */
export interface NotificationComponentConfig {
  apiBaseUrl: string;
  signalRHubUrl: string;
  userId: string;
  accessToken?: string;
  onNotificationClick?: (notification: Notification) => void;
  maxNotifications?: number;
}

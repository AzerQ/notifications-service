/**
 * Notification types aligned with backend API
 */

/**
 * Action button in notification
 */
export interface NotificationAction {
  name: string;
  label: string;
  url?: string;
}

/**
 * Parameter in notification
 */
export interface NotificationParameter {
  key: string;
  value: string;
  description?: string;
}

/**
 * Icon configuration from backend
 */
export interface NotificationIcon {
  name: string;
  cssClass?: string;
}

/**
 * Base notification model matching backend API response
 */
export interface Notification {
  id: string;
  receiverId: string;
  type: string;
  subType?: string;
  title: string;
  content: string;
  url?: string;
  icon?: NotificationIcon;
  date: string;
  read: boolean;
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
  
  // Legacy fields for backward compatibility
  category?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Paginated response from API
 */
export interface PaginatedNotifications {
  notifications: Notification[];
  totalItemsCount: number;
  request?: {
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
 * Note: User ID is extracted from JWT token on backend, no need to pass it from frontend
 */
export interface NotificationComponentConfig {
  apiBaseUrl: string;
  signalRHubUrl: string;
  accessToken?: string;
  onNotificationClick?: (notification: Notification) => void;
  maxNotifications?: number;
  onEmailCodeRequired?: (email: string, challengeId: string) => void;
  userEmail?: string; // ������������ email ������������ ��� �������������� �������� ����
}


/**
 * User route preference model matching backend API response
 */
export interface UserRoutePreference {
  id: string;
  userId: string;
  route: string;
  enabled: boolean;
  routeDisplayName: string;
  routeDescription: string;
}

/**
 * Request DTO for updating user preferences
 */
export interface UserPreferenceDto {
  route: string;
  enabled: boolean;
  id?: string | null;
}

/**
 * User route preference view model (matches backend UserRoutePreferenceView)
 */
export interface UserRoutePreferenceView {
  id?: string;
  userId: string;
  route: string;
  enabled: boolean;
  routeDisplayName: string;
  routeDescription?: string;
}

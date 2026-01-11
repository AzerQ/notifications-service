/**
 * Notification types aligned with backend API
 * @module Types
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
  /** Unique identifier (GUID) */
  id: string;
  /** ID of the user receiving the notification */
  receiverId: string;
  /** Primary category of the notification */
  type: string;
  /** Secondary category or specific event type */
  subType?: string;
  /** Short summary of the notification */
  title: string;
  /** Detailed message content */
  content: string;
  /** Optional link to open when clicked */
  url?: string;
  /** Icon configuration */
  icon?: NotificationIcon;
  /** ISO 8601 date string */
  date: string;
  /** Read status flag */
  read: boolean;
  /** Name of the entity that triggered the notification */
  author?: string;
  /** List of interactive buttons */
  actions?: NotificationAction[];
  /** Tags for categorization */
  hashtags?: string[];
  /** Key-value pairs for template rendering or extra data */
  parameters?: NotificationParameter[];
  
  // Legacy fields for backward compatibility
  /** @deprecated Use type instead */
  category?: string;
  /** @deprecated Use date instead */
  createdAt?: string;
  /** @deprecated Use actions and parameters instead */
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
  dateRange?: 'all' | 'today' | 'week' | 'month';
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

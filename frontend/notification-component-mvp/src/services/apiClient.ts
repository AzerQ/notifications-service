import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  Notification,
  PaginatedNotifications,
  GetNotificationsParams,
  UserRoutePreference,
  UserPreferenceDto,
  UserRoutePreferenceView
} from '../types';
import type { AuthenticationService } from './authenticationService';

/**
 * API client for notification service with automatic authentication
 */
export class NotificationApiClient {
  private client: AxiosInstance;
  private authService?: AuthenticationService;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL: string, accessToken?: string, authService?: AuthenticationService) {
    this.authService = authService;
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors for automatic auth
   */
  private setupInterceptors(): void {
    // Request interceptor - add access token to headers
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.authService?.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 errors with automatic re-auth
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we have auth service and haven't retried yet
        if (error.response?.status === 401 && this.authService && !originalRequest._retry) {
          // Mark as retry BEFORE checking isRefreshing to prevent infinite loops
          originalRequest._retry = true;

          if (this.isRefreshing) {
            // Queue this request while authentication is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          this.isRefreshing = true;

          try {
            console.log('[ApiClient] 401 detected, starting automatic authentication...');
      
            // Try automatic authentication (refresh token -> Windows -> email)
            const tokens = await this.authService.authenticate();
         
            if (tokens) {
              console.log('[ApiClient] Authentication successful, retrying requests');
      
              // Process queued requests
              this.processQueue(null);
        
              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
              }
              return this.client(originalRequest);
            } else {
              console.log('[ApiClient] Authentication failed, email code required');
    
               // Clear queue - authentication failed
              const authError = new Error('Authentication required');
              this.processQueue(authError);
        
              return Promise.reject(authError);
            }
          } catch (authError) {
            console.error('[ApiClient] Authentication error:', authError);
        
            this.processQueue(authError);
            return Promise.reject(authError);
       } finally {
            this.isRefreshing = false;
          }
        }

      return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after authentication
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Get notifications for a user with pagination
   */
  async getNotifications(
    params?: GetNotificationsParams
  ): Promise<PaginatedNotifications> {
    const { page = 1, pageSize = 50, filters } = params || {};
    
    const response = await this.client.get<Notification[]>(
      `/api/notification/personal`, 
      {
 params: {
    pageNumber: page,
          pageSize,
          onlyUnread: filters?.onlyUnread,
  ...filters
   }
      }
    );
    
  // Backend returns array directly, wrap it in PaginatedNotifications format
    const notifications = response.data;
    
    return {
  notifications,
      totalItemsCount: notifications.length,
      request: {
        pageNumber: page,
        pageSize
      }
};
  }

  async setReadFlag(notificationId: string, flagValue: boolean) {
      const params = new URLSearchParams({notificationId, flagValue: flagValue.toString()});
      await this.client.put(`/api/notification/set-read-flag?${params}`);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
      await this.setReadFlag(notificationId, true);
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId: string): Promise<void> {
    await this.setReadFlag(notificationId, false);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.client.put(`/api/notification/personal/mark-all-read`);
  }

  /**
    * Update access token
    */
  setAccessToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get user route preferences
   */
  async getUserPreferences(): Promise<UserRoutePreference[]> {
    const currentUser = this.authService?.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const response = await this.client.get<UserRoutePreferenceView[]>(
      `/api/users/${currentUser.userId}/routes`
    );
    
    // Convert UserRoutePreferenceView to UserRoutePreference
    return response.data.map(pref => ({
      id: pref.id || '',
      userId: pref.userId,
      route: pref.route,
      enabled: pref.enabled,
      routeDisplayName: pref.routeDisplayName,
      routeDescription: pref.routeDescription || ''
    }));
  }

  /**
   * Update user route preferences
   */
  async updateUserPreferences(preferences: UserPreferenceDto[]): Promise<void> {
    const currentUser = this.authService?.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    await this.client.put(
      `/api/users/${currentUser.userId}/routes`,
      preferences
    );
  }
}

/**
 * Create notification API client instance
 */
export function createNotificationApiClient(
  baseURL: string, 
  accessToken?: string,
  authService?: AuthenticationService
): NotificationApiClient {
  return new NotificationApiClient(baseURL, accessToken, authService);
}

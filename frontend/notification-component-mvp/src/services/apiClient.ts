import axios, { AxiosInstance } from 'axios';
import type { 
  PaginatedNotifications, 
  GetNotificationsParams 
} from '../types';

/**
 * Simple API client for notification service
 */
export class NotificationApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, accessToken?: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      }
    });
  }

  /**
   * Get notifications for a user with pagination
   */
  async getNotifications(
    params?: GetNotificationsParams
  ): Promise<PaginatedNotifications> {
    const { page = 1, pageSize = 50, filters } = params || {};
    
    const response = await this.client.get<PaginatedNotifications>(
      `/api/notification/personal`, 
      {
        params: {
          pageNumber: page,
          pageSize,
          ...filters
        }
      }
    );
    
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.client.put(`/api/notification/${notificationId}/read`, {
      read: true
    });
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId: string): Promise<void> {
    await this.client.put(`/api/notification/${notificationId}/read`, {
      read: false
    });
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
}

/**
 * Create notification API client instance
 */
export function createNotificationApiClient(
  baseURL: string, 
  accessToken?: string
): NotificationApiClient {
  return new NotificationApiClient(baseURL, accessToken);
}

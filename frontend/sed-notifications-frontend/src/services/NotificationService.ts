import { 
  INotificationService, 
  PaginatedResponse, 
  GetNotificationsParams 
} from './contracts/INotificationService';
import { InAppNotificationData, UserNotificationSettings, ToastSettings } from '../NotificationsBar/types';
import { ApiClient } from './apiClient';

/**
 * Real Notification Service that communicates with the backend API
 */
export class NotificationService implements INotificationService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string = '/api/notifications') {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getUnreadNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>> {
    try {
      const response = await this.apiClient.instance.get<PaginatedResponse<InAppNotificationData>>(
        `${this.baseUrl}/unread`,
        {
          params: {
            page: params.page,
            pageSize: params.pageSize,
            ...params.filters
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      throw error;
    }
  }

  async getAllNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>> {
    try {
      const response = await this.apiClient.instance.get<PaginatedResponse<InAppNotificationData>>(
        `${this.baseUrl}/all`,
        {
          params: {
            page: params.page,
            pageSize: params.pageSize,
            ...params.filters
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: number): Promise<void> {
    try {
      await this.apiClient.instance.post(
        `${this.baseUrl}/${notificationId}/mark-as-read`
      );
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  async markMultipleAsRead(notificationIds: number[]): Promise<void> {
    try {
      await this.apiClient.instance.post(
        `${this.baseUrl}/mark-multiple-as-read`,
        { notificationIds }
      );
    } catch (error) {
      console.error('Failed to mark multiple notifications as read:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.apiClient.instance.get<{ count: number }>(
        `${this.baseUrl}/unread-count`
      );
      return response.data.count;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  }

  async getUserNotificationSettings(): Promise<UserNotificationSettings> {
    try {
      const response = await this.apiClient.instance.get<UserNotificationSettings>(
        `${this.baseUrl}/settings`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user notification settings:', error);
      throw error;
    }
  }

  async saveUserNotificationSettings(settings: UserNotificationSettings): Promise<void> {
    try {
      await this.apiClient.instance.post(
        `${this.baseUrl}/settings`,
        settings
      );
    } catch (error) {
      console.error('Failed to save user notification settings:', error);
      throw error;
    }
  }

  async getToastSettings(): Promise<ToastSettings> {
    try {
      const response = await this.apiClient.instance.get<ToastSettings>(
        `${this.baseUrl}/toast-settings`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch toast settings:', error);
      throw error;
    }
  }

  async saveToastSettings(settings: ToastSettings): Promise<void> {
    try {
      await this.apiClient.instance.post(
        `${this.baseUrl}/toast-settings`,
        settings
      );
    } catch (error) {
      console.error('Failed to save toast settings:', error);
      throw error;
    }
  }
}

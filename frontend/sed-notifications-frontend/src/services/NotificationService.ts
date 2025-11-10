import { 
  INotificationService, 
  PaginatedResponse, 
  GetNotificationsParams 
} from './contracts/INotificationService';
import { InAppNotificationData } from '../NotificationsBar/types';
import { ApiClient } from './apiClient';

/**
 * Real Notification Service that communicates with the backend API
 * Implements the actual backend API endpoints
 */
export class NotificationService implements INotificationService {
  private apiClient: ApiClient;
  private baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string = '/api/notification') {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>> {
    try {
      const response = await this.apiClient.instance.get<PaginatedResponse<InAppNotificationData>>(
        `${this.baseUrl}/personal`,
        {
          params: {
            onlyUnread: params.filters?.onlyUnread ?? false,
            pageSize: params.pageSize,
            pageNumber: params.page
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async setReadFlag(notificationId: string, flagValue: boolean): Promise<void> {
    try {
      await this.apiClient.instance.put(
        `${this.baseUrl}/set-read-flag`,
        null,
        {
          params: {
            notificationId,
            flagValue
          }
        }
      );
    } catch (error) {
      console.error(`Failed to set read flag for notification ${notificationId}:`, error);
      throw error;
    }
  }
}

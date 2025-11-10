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
      const requestParams = {
        onlyUnread: params.filters?.onlyUnread ?? false,
        pageSize: params.pageSize,
        pageNumber: params.page
      };
      
      const response = await this.apiClient.instance.get<any>(
        `${this.baseUrl}/personal`,
        {
          params: requestParams
        }
      );
      
      // API может возвращать данные в разных форматах:
      // 1. Прямой массив уведомлений
      // 2. Объект с полем notifications
      // 3. Объект с полем data
      let notifications: InAppNotificationData[] = [];
      let totalItemsCount = 0;
      
      if (Array.isArray(response.data)) {
        notifications = response.data;
        totalItemsCount = response.data.length;
      } else if (response.data.notifications && Array.isArray(response.data.notifications)) {
        notifications = response.data.notifications;
        totalItemsCount = response.data.totalItemsCount || response.data.notifications.length;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        notifications = response.data.data;
        totalItemsCount = response.data.totalItemsCount || response.data.data.length;
      }
      
      // Применяем фильтр по непрочитанным если нужно
      if (params.filters?.onlyUnread) {
        notifications = notifications.filter(n => !n.read);
      }
      
      // Пагинация
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedNotifications = notifications.slice(startIndex, endIndex);
      
      return {
        notifications: paginatedNotifications,
        request: {
          onlyUnread: params.filters?.onlyUnread ?? false,
          pageSize: params.pageSize,
          pageNumber: params.page
        },
        totalItemsCount: notifications.length
      };
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

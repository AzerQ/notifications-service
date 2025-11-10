import { 
  INotificationService, 
  PaginatedResponse, 
  GetNotificationsParams 
} from '../contracts/INotificationService';
import { InAppNotificationData } from '../../NotificationsBar/types';
import { mockNotifications } from '../../MockNotifications';

export class MockNotificationService implements INotificationService {
  private notifications: InAppNotificationData[] = [...mockNotifications];

  async getNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>> {
    // Симуляция задержки сети
    await this.delay(300 + Math.random() * 500);

    let filtered = [...this.notifications];

    // Применяем фильтр по непрочитанным
    if (params.filters?.onlyUnread) {
      filtered = filtered.filter(n => !n.read);
    }

    // Сортировка по дате (новые сначала)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Пагинация
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      notifications: paginatedData,
      request: {
        onlyUnread: params.filters?.onlyUnread ?? false,
        pageSize: params.pageSize,
        pageNumber: params.page
      },
      totalItemsCount: filtered.length
    };
  }

  async setReadFlag(notificationId: string, flagValue: boolean): Promise<void> {
    // Симуляция задержки сети
    await this.delay(200 + Math.random() * 300);

    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = flagValue;
    }
  }

  // Методы для управления mock-данными (для тестирования)
  
  /**
   * Добавить новое уведомление (для имитации real-time обновлений)
   */
  addNotification(notification: InAppNotificationData): void {
    this.notifications.unshift(notification);
  }

  /**
   * Получить все уведомления (для синхронизации с другими сервисами)
   */
  getAllNotificationsSync(): InAppNotificationData[] {
    return [...this.notifications];
  }

  /**
   * Обновить уведомления (для синхронизации с другими сервисами)
   */
  updateNotifications(notifications: InAppNotificationData[]): void {
    this.notifications = [...notifications];
  }

  /**
   * Сбросить данные к исходному состоянию
   */
  resetToDefaults(): void {
    this.notifications = [...mockNotifications];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

import { 
  INotificationService, 
  PaginatedResponse, 
  GetNotificationsParams 
} from '../contracts/INotificationService';
import { InAppNotificationData, UserNotificationSettings, NotificationEventSetting, ToastSettings, DEFAULT_TOAST_SETTINGS } from '../../NotificationsBar/types';
import { mockNotifications } from '../../MockNotifications';

export class MockNotificationService implements INotificationService {
  private notifications: InAppNotificationData[] = [...mockNotifications];
  private userSettings: UserNotificationSettings = this.getDefaultUserSettings();

  async getUnreadNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>> {
    // Симуляция задержки сети
    await this.delay(300 + Math.random() * 500);

    let filtered = this.notifications.filter(n => !n.read);

    // Применяем фильтры
    if (params.filters) {
      if (params.filters.type) {
        filtered = filtered.filter(n => n.type === params.filters!.type);
      }
      if (params.filters.subtype) {
        filtered = filtered.filter(n => n.subtype === params.filters!.subtype);
      }
      if (params.filters.author) {
        filtered = filtered.filter(n => 
          n.author.toLowerCase().includes(params.filters!.author!.toLowerCase())
        );
      }
      if (params.filters.dateFrom) {
        filtered = filtered.filter(n => new Date(n.date) >= new Date(params.filters!.dateFrom!));
      }
      if (params.filters.dateTo) {
        filtered = filtered.filter(n => new Date(n.date) <= new Date(params.filters!.dateTo!));
      }
    }

    // Сортировка по дате (новые сначала)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Пагинация
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filtered.length / params.pageSize)
    };
  }

  async getAllNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>> {
    // Симуляция задержки сети
    await this.delay(400 + Math.random() * 600);

    let filtered = [...this.notifications];

    // Применяем фильтры
    if (params.filters) {
      if (params.filters.type) {
        filtered = filtered.filter(n => n.type === params.filters!.type);
      }
      if (params.filters.subtype) {
        filtered = filtered.filter(n => n.subtype === params.filters!.subtype);
      }
      if (params.filters.author) {
        filtered = filtered.filter(n => 
          n.author.toLowerCase().includes(params.filters!.author!.toLowerCase())
        );
      }
      if (params.filters.dateFrom) {
        filtered = filtered.filter(n => new Date(n.date) >= new Date(params.filters!.dateFrom!));
      }
      if (params.filters.dateTo) {
        filtered = filtered.filter(n => new Date(n.date) <= new Date(params.filters!.dateTo!));
      }
    }

    // Сортировка по дате (новые сначала)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Пагинация
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filtered.length / params.pageSize)
    };
  }

  async markAsRead(notificationId: number): Promise<void> {
    // Симуляция задержки сети
    await this.delay(200 + Math.random() * 300);

    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  async markMultipleAsRead(notificationIds: number[]): Promise<void> {
    // Симуляция задержки сети
    await this.delay(300 + Math.random() * 500);

    notificationIds.forEach(id => {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    });
  }

  async getUnreadCount(): Promise<number> {
    // Симуляция задержки сети
    await this.delay(100 + Math.random() * 200);

    return this.notifications.filter(n => !n.read).length;
  }

  async getUserNotificationSettings(): Promise<UserNotificationSettings> {
    // Симуляция задержки сети
    await this.delay(200 + Math.random() * 300);

    return { ...this.userSettings };
  }

  async saveUserNotificationSettings(settings: UserNotificationSettings): Promise<void> {
    // Симуляция задержки сети
    await this.delay(300 + Math.random() * 500);

    this.userSettings = { ...settings, lastUpdated: new Date().toISOString() };
  }

  async getToastSettings(): Promise<ToastSettings> {
    // Симуляция задержки сети
    await this.delay(100 + Math.random() * 200);

    // Получаем настройки из localStorage
    const storedSettings = localStorage.getItem('toast-settings');
    if (storedSettings) {
      try {
        return JSON.parse(storedSettings);
      } catch (error) {
        console.error('Ошибка при парсинге настроек тостов:', error);
      }
    }

    // Возвращаем настройки по умолчанию
    return { ...DEFAULT_TOAST_SETTINGS };
  }

  async saveToastSettings(settings: ToastSettings): Promise<void> {
    // Симуляция задержки сети
    await this.delay(200 + Math.random() * 300);

    // Сохраняем настройки в localStorage
    localStorage.setItem('toast-settings', JSON.stringify(settings));
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
    this.userSettings = this.getDefaultUserSettings();
  }

  private getDefaultUserSettings(): UserNotificationSettings {
    const defaultEventSettings: NotificationEventSetting[] = [
      {
        eventId: 'document_created',
        eventName: 'Создание документа',
        eventDescription: 'Уведомление о создании нового документа',
        personalSettings: [
          { channel: 'email', enabled: true },
          { channel: 'push', enabled: true },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: false }
        ],
        substituteSettings: [
          { channel: 'email', enabled: true },
          { channel: 'push', enabled: false },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: false }
        ]
      },
      {
        eventId: 'document_approved',
        eventName: 'Согласование документа',
        eventDescription: 'Уведомление о согласовании документа',
        personalSettings: [
          { channel: 'email', enabled: true },
          { channel: 'push', enabled: true },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: false }
        ],
        substituteSettings: [
          { channel: 'email', enabled: true },
          { channel: 'push', enabled: true },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: true }
        ]
      },
      {
        eventId: 'task_assigned',
        eventName: 'Назначение задачи',
        eventDescription: 'Уведомление о назначении новой задачи',
        personalSettings: [
          { channel: 'email', enabled: true },
          { channel: 'push', enabled: true },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: false }
        ],
        substituteSettings: [
          { channel: 'email', enabled: false },
          { channel: 'push', enabled: false },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: false }
        ]
      },
      {
        eventId: 'task_completed',
        eventName: 'Выполнение задачи',
        eventDescription: 'Уведомление о выполнении задачи',
        personalSettings: [
          { channel: 'email', enabled: false },
          { channel: 'push', enabled: true },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: false }
        ],
        substituteSettings: [
          { channel: 'email', enabled: false },
          { channel: 'push', enabled: false },
          { channel: 'inApp', enabled: false },
          { channel: 'sms', enabled: false }
        ]
      },
      {
        eventId: 'system_maintenance',
        eventName: 'Техническое обслуживание',
        eventDescription: 'Уведомления о плановых работах и обслуживании системы',
        personalSettings: [
          { channel: 'email', enabled: true },
          { channel: 'push', enabled: false },
          { channel: 'inApp', enabled: true },
          { channel: 'sms', enabled: false }
        ],
        substituteSettings: [
          { channel: 'email', enabled: false },
          { channel: 'push', enabled: false },
          { channel: 'inApp', enabled: false },
          { channel: 'sms', enabled: false }
        ]
      }
    ];

    return {
      userId: 'current-user',
      eventSettings: defaultEventSettings,
      lastUpdated: new Date().toISOString()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
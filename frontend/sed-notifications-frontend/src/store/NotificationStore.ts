import { makeAutoObservable, runInAction } from 'mobx';
import { InAppNotificationData, UserNotificationSettings, ToastSettings, DEFAULT_TOAST_SETTINGS } from '../NotificationsBar/types';
import { 
  INotificationService, 
  GetNotificationsParams, 
  PaginatedResponse, 
  NotificationFilters 
} from '../services/contracts/INotificationService';
import { 
  ISignalRNotificationService, 
  CompactNotificationData 
} from '../services/contracts/ISignalRNotificationService';

export interface NotificationStoreState {
  // Данные уведомлений
  notifications: InAppNotificationData[];
  unreadNotifications: InAppNotificationData[];
  
  // Состояние загрузки
  isLoading: boolean;
  isLoadingUnread: boolean;
  isConnectingSignalR: boolean;
  
  // Пагинация
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalNotifications: number;
  
  // Фильтры
  filters: NotificationFilters;
  
  // Ошибки
  error: string | null;
  signalRError: string | null;
  
  // SignalR состояние
  isSignalRConnected: boolean;
  
  // UI состояние
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  
  // Настройки тостов
  toastSettings: ToastSettings;
}

export class NotificationStore {
  // Состояние
  notifications: InAppNotificationData[] = [];
  unreadNotifications: InAppNotificationData[] = [];
  
  isLoading = false;
  isLoadingUnread = false;
  isConnectingSignalR = false;
  
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;
  totalNotifications = 0;
  
  filters: NotificationFilters = {};
  
  error: string | null = null;
  signalRError: string | null = null;
  
  isSignalRConnected = false;
  
  // UI состояние
  isSidebarOpen = false;
  isModalOpen = false;
  
  // Настройки тостов
  toastSettings: ToastSettings = { ...DEFAULT_TOAST_SETTINGS };

  // Колбек для показа всплывающих уведомлений
  private showCompactToastCallback?: (notification: CompactNotificationData) => void;

  constructor(
    private notificationService: INotificationService,
    private signalRService: ISignalRNotificationService
  ) {
    makeAutoObservable(this);
    this.initializeSignalR();
    this.loadToastSettings();
  }

  // Метод для установки колбека показа всплывающих уведомлений
  setShowCompactToastCallback(callback: (notification: CompactNotificationData) => void): void {
    this.showCompactToastCallback = callback;
  }

  // Геттеры
  get unreadCount(): number {
    return this.unreadNotifications.length;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }

  get isAnyLoading(): boolean {
    return this.isLoading || this.isLoadingUnread || this.isConnectingSignalR;
  }

  // Действия для загрузки данных
  async loadUnreadNotifications(params?: Partial<GetNotificationsParams>): Promise<void> {
    this.isLoadingUnread = true;
    this.error = null;

    try {
      const requestParams: GetNotificationsParams = {
        page: 1,
        pageSize: 50, // Больше для боковой панели
        filters: this.filters,
        ...params
      };

      const response = await this.notificationService.getUnreadNotifications(requestParams);
      
      runInAction(() => {
        this.unreadNotifications = response.data;
        this.isLoadingUnread = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки непрочитанных уведомлений';
        this.isLoadingUnread = false;
      });
    }
  }

  async loadAllNotifications(params?: Partial<GetNotificationsParams>): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const requestParams: GetNotificationsParams = {
        page: this.currentPage,
        pageSize: this.pageSize,
        filters: this.filters,
        ...params
      };

      const response = await this.notificationService.getAllNotifications(requestParams);
      
      runInAction(() => {
        this.notifications = response.data;
        this.totalPages = response.totalPages;
        this.totalNotifications = response.total;
        this.currentPage = response.page;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки уведомлений';
        this.isLoading = false;
      });
    }
  }

  // Действия для работы с уведомлениями
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await this.notificationService.markAsRead(notificationId);
      
      runInAction(() => {
        // Обновляем в основном списке
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
        
        // Удаляем из непрочитанных
        this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notificationId);
      });
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка отметки уведомления как прочитанного';
    }
  }

  async markAllAsRead(): Promise<void> {
    if (this.unreadNotifications.length === 0) return;

    try {
      const unreadIds = this.unreadNotifications.map(n => n.id);
      await this.notificationService.markMultipleAsRead(unreadIds);
      
      runInAction(() => {
        // Обновляем в основном списке
        this.notifications.forEach(notification => {
          if (unreadIds.includes(notification.id)) {
            notification.read = true;
          }
        });
        
        // Очищаем непрочитанные
        this.unreadNotifications = [];
      });
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка отметки всех уведомлений как прочитанных';
    }
  }

  // Действия для пагинации
  setPage(page: number): void {
    if (page !== this.currentPage && page > 0) {
      this.currentPage = page;
      this.loadAllNotifications();
    }
  }

  setPageSize(pageSize: number): void {
    if (pageSize !== this.pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1; // Сбрасываем на первую страницу
      this.loadAllNotifications();
    }
  }

  // Действия для фильтров
  setFilters(filters: Partial<NotificationFilters>): void {
    this.filters = { ...this.filters, ...filters };
    this.currentPage = 1; // Сбрасываем на первую страницу
    this.loadAllNotifications();
    this.loadUnreadNotifications();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadAllNotifications();
    this.loadUnreadNotifications();
  }

  // Действия для очистки ошибок
  clearError(): void {
    this.error = null;
  }

  clearSignalRError(): void {
    this.signalRError = null;
  }

  // SignalR методы
  private async initializeSignalR(): Promise<void> {
    this.isConnectingSignalR = true;
    this.signalRError = null;

    try {
      // Подписываемся на события
      this.signalRService.onNewNotification(this.handleNewNotification.bind(this));
      this.signalRService.onNotificationStatusUpdate(this.handleNotificationStatusUpdate.bind(this));
      
      // Запускаем соединение
      await this.signalRService.startConnection();
      
      runInAction(() => {
        this.isSignalRConnected = true;
        this.isConnectingSignalR = false;
      });
    } catch (error) {
      runInAction(() => {
        this.signalRError = error instanceof Error ? error.message : 'Ошибка подключения к SignalR';
        this.isConnectingSignalR = false;
      });
    }
  }

  async reconnectSignalR(): Promise<void> {
    this.initializeSignalR();
  }

  async disconnectSignalR(): Promise<void> {
    try {
      await this.signalRService.stopConnection();
      runInAction(() => {
        this.isSignalRConnected = false;
      });
    } catch (error) {
      this.signalRError = error instanceof Error ? error.message : 'Ошибка отключения от SignalR';
    }
  }

  // Обработчики SignalR событий
  private handleNewNotification(compactNotification: CompactNotificationData): void {
    // Показываем всплывающее уведомление только если не открыты sidebar или modal
    if (this.shouldShowToasts && this.showCompactToastCallback) {
      this.showCompactToastCallback(compactNotification);
    }

    // Конвертируем компактное уведомление в полное
    const fullNotification: InAppNotificationData = {
      id: compactNotification.id,
      title: compactNotification.title,
      type: compactNotification.type as any,
      subtype: compactNotification.subtype || '',
      description: '', // Будет загружено при открытии
      content: '', // Будет загружено при открытии
      author: compactNotification.author,
      date: compactNotification.date,
      read: compactNotification.read,
      starred: false,
      delegate: false,
      actions: []
    };

    runInAction(() => {
      // Добавляем в начало списков
      this.notifications.unshift(fullNotification);
      if (!fullNotification.read) {
        this.unreadNotifications.unshift(fullNotification);
      }
      
      // Обновляем счетчики
      this.totalNotifications += 1;
    });
  }

  private handleNotificationStatusUpdate(notificationId: number, isRead: boolean): void {
    runInAction(() => {
      // Обновляем в основном списке
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = isRead;
      }
      
      // Обновляем в непрочитанных
      if (isRead) {
        this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notificationId);
      } else {
        const unreadNotification = this.notifications.find(n => n.id === notificationId);
        if (unreadNotification && !this.unreadNotifications.find(n => n.id === notificationId)) {
          this.unreadNotifications.unshift(unreadNotification);
        }
      }
    });
  }

  // Методы для очистки ресурсов
  dispose(): void {
    this.signalRService.offAllEvents();
    this.signalRService.stopConnection();
  }

  // Методы для настроек уведомлений
  async getUserNotificationSettings(): Promise<UserNotificationSettings> {
    return await this.notificationService.getUserNotificationSettings();
  }

  async saveUserNotificationSettings(settings: UserNotificationSettings): Promise<void> {
    return await this.notificationService.saveUserNotificationSettings(settings);
  }

  // Методы для UI состояния
  setSidebarOpen(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  setModalOpen(isOpen: boolean): void {
    this.isModalOpen = isOpen;
  }

  // Геттер для проверки, нужно ли показывать тосты
  get shouldShowToasts(): boolean {
    // Не показываем тосты, если открыт sidebar или modal
    return !this.isSidebarOpen && !this.isModalOpen;
  }

  // Методы для настроек тостов
  async loadToastSettings(): Promise<void> {
    try {
      const settings = await this.notificationService.getToastSettings();
      runInAction(() => {
        this.toastSettings = settings;
      });
    } catch (error) {
      console.error('Ошибка загрузки настроек тостов:', error);
      // Оставляем настройки по умолчанию
    }
  }

  async getToastSettings(): Promise<ToastSettings> {
    return await this.notificationService.getToastSettings();
  }

  async saveToastSettings(settings: ToastSettings): Promise<void> {
    try {
      await this.notificationService.saveToastSettings(settings);
      runInAction(() => {
        this.toastSettings = settings;
      });
    } catch (error) {
      console.error('Ошибка сохранения настроек тостов:', error);
      throw error;
    }
  }
}
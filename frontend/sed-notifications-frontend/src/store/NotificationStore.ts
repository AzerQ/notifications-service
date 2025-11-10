import { makeAutoObservable, runInAction } from 'mobx';
import { InAppNotificationData, DEFAULT_TOAST_SETTINGS, ToastSettings } from '../NotificationsBar/types';
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
  
  // Состояние загрузки
  isLoading: boolean;
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
  
  // Состояние авторизации
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  authMethod: 'windows' | 'email' | null;
  showAuthForm: boolean;
}

export class NotificationStore {
  // Состояние
  notifications: InAppNotificationData[] = [];
  
  isLoading = false;
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
  
  // Состояние авторизации
  isAuthenticated = false;
  isAuthenticating = false;
  authError: string | null = null;
  authMethod: 'windows' | 'email' | null = null;
  showAuthForm = false;
  
  // Toast настройки
  toastSettings: ToastSettings = DEFAULT_TOAST_SETTINGS;

  // Колбек для показа всплывающих уведомлений
  private showCompactToastCallback?: (notification: CompactNotificationData) => void;
  
  // Флаг инициализации
  private isInitialized = false;

  constructor(
    private notificationService: INotificationService,
    private signalRService: ISignalRNotificationService
  ) {
    // Ensure notifications is always initialized as an array
    this.notifications = [];
    
    makeAutoObservable(this);
    
    // Initialize SignalR asynchronously to avoid blocking constructor
    setTimeout(() => {
      this.initializeSignalR();
    }, 0);
  }

  // Метод для установки колбека показа всплывающих уведомлений
  setShowCompactToastCallback(callback: (notification: CompactNotificationData) => void): void {
    this.showCompactToastCallback = callback;
  }

  // Геттеры
  get unreadCount(): number {
    return (this.notifications || []).filter(n => !n.read).length;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }

  get isAnyLoading(): boolean {
    return this.isLoading || this.isConnectingSignalR;
  }

  // Действия для загрузки данных
  async loadNotifications(params?: Partial<GetNotificationsParams>): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const requestParams: GetNotificationsParams = {
        page: this.currentPage,
        pageSize: this.pageSize,
        filters: this.filters,
        ...params
      };

      const response = await this.notificationService.getNotifications(requestParams);
      
      runInAction(() => {
        this.notifications = response.notifications || [];
        this.totalNotifications = response.totalItemsCount;
        // Вычисляем totalPages на основе totalItemsCount и pageSize
        this.totalPages = Math.ceil(response.totalItemsCount / this.pageSize);
        this.currentPage = response.request.pageNumber;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки уведомлений';
        this.isLoading = false;
      });
    }
  }

  // Загрузить последние 200 уведомлений при инициализации
  async initializeNotifications(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    this.isLoading = true;
    this.error = null;

    try {
      const requestParams: GetNotificationsParams = {
        page: 1,
        pageSize: 200,
        filters: {}
      };

      const response = await this.notificationService.getNotifications(requestParams);
      
      runInAction(() => {
        this.notifications = response.notifications || [];
        this.totalNotifications = response.totalItemsCount;
        this.totalPages = Math.ceil(response.totalItemsCount / this.pageSize);
        this.currentPage = 1;
        this.isLoading = false;
        this.isInitialized = true;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки уведомлений';
        this.isLoading = false;
      });
    }
  }

  // Загрузить только непрочитанные уведомления
  async loadUnreadNotifications(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const requestParams: GetNotificationsParams = {
        page: 1,
        pageSize: 200,
        filters: { onlyUnread: true }
      };

      const response = await this.notificationService.getNotifications(requestParams);
      
      runInAction(() => {
        this.notifications = response.notifications || [];
        this.totalNotifications = response.totalItemsCount;
        this.totalPages = Math.ceil(response.totalItemsCount / this.pageSize);
        this.currentPage = 1;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки непрочитанных уведомлений';
        this.isLoading = false;
      });
    }
  }

  // Перезагрузить последние уведомления
  async reloadNotifications(): Promise<void> {
    this.currentPage = 1;
    await this.loadNotifications();
  }

  // Действия для работы с уведомлениями
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.notificationService.setReadFlag(notificationId, true);
      
      runInAction(() => {
        const notification = (this.notifications || []).find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      });
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка отметки уведомления как прочитанного';
    }
  }

  async markAsUnread(notificationId: string): Promise<void> {
    try {
      await this.notificationService.setReadFlag(notificationId, false);
      
      runInAction(() => {
        const notification = (this.notifications || []).find(n => n.id === notificationId);
        if (notification) {
          notification.read = false;
        }
      });
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка отметки уведомления как непрочитанного';
    }
  }

  async markAllAsRead(): Promise<void> {
    const unreadNotifications = (this.notifications || []).filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      // Отмечаем все непрочитанные уведомления как прочитанные
      await Promise.all(
        unreadNotifications.map(n => this.notificationService.setReadFlag(n.id, true))
      );
      
      runInAction(() => {
        (this.notifications || []).forEach(notification => {
          notification.read = true;
        });
      });
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Ошибка отметки всех уведомлений как прочитанных';
    }
  }

  // Действия для пагинации
  setPage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadNotifications();
    }
  }

  setPageSize(pageSize: number): void {
    if (pageSize !== this.pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1; // Сбрасываем на первую страницу
      this.loadNotifications();
    }
  }

  // Действия для фильтров
  setFilters(filters: Partial<NotificationFilters>): void {
    this.filters = { ...this.filters, ...filters };
    this.currentPage = 1; // Сбрасываем на первую страницу
    this.loadNotifications();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadNotifications();
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
  private handleNewNotification(notification: CompactNotificationData): void {
    // Показываем всплывающее уведомление только если не открыты sidebar или modal
    if (this.shouldShowToasts && this.showCompactToastCallback) {
      this.showCompactToastCallback(notification);
    }

    // CompactNotificationData теперь это полная модель Notification из бэкенда
    // Используем её напрямую без преобразований
    const fullNotification: InAppNotificationData = notification;

    runInAction(() => {
      // Добавляем в начало списка
      if (this.notifications) {
        this.notifications.unshift(fullNotification);
      } else {
        this.notifications = [fullNotification];
      }
      
      // Обновляем счетчики
      this.totalNotifications += 1;
    });
  }

  private handleNotificationStatusUpdate(notificationId: string, isRead: boolean): void {
    runInAction(() => {
      const notification = (this.notifications || []).find(n => n.id === notificationId);
      if (notification) {
        notification.read = isRead;
      }
    });
  }

  // Методы для очистки ресурсов
  dispose(): void {
    this.signalRService.offAllEvents();
    this.signalRService.stopConnection();
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

  // Методы для управления состоянием авторизации
  setAuthenticating(isAuthenticating: boolean): void {
    this.isAuthenticating = isAuthenticating;
  }

  setAuthenticated(isAuthenticated: boolean, authMethod?: 'windows' | 'email'): void {
    this.isAuthenticated = isAuthenticated;
    this.authMethod = authMethod || null;
    this.authError = null;
    this.showAuthForm = false;
  }

  setAuthError(error: string | null): void {
    this.authError = error;
  }

  setShowAuthForm(show: boolean): void {
    this.showAuthForm = show;
  }

  clearAuthError(): void {
    this.authError = null;
  }
}

import { InAppNotificationData, UserNotificationSettings, ToastSettings } from '../../NotificationsBar/types';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationFilters {
  type?: string;
  subtype?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetNotificationsParams extends PaginationParams {
  filters?: NotificationFilters;
}

export interface PageSizePreset {
  label: string;
  value: number;
}

export const PAGE_SIZE_PRESETS: PageSizePreset[] = [
  { label: '10 на странице', value: 10 },
  { label: '20 на странице', value: 20 },
  { label: '50 на странице', value: 50 },
  { label: '100 на странице', value: 100 }
];

export interface INotificationService {
  /**
   * Получить новые непрочитанные уведомления с пагинацией
   */
  getUnreadNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>>;
  
  /**
   * Получить все уведомления пользователя с пагинацией
   */
  getAllNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>>;
  
  /**
   * Отметить уведомление как прочитанное по идентификатору
   */
  markAsRead(notificationId: number): Promise<void>;
  
  /**
   * Отметить несколько уведомлений как прочитанные
   */
  markMultipleAsRead(notificationIds: number[]): Promise<void>;
  
  /**
   * Получить количество непрочитанных уведомлений
   */
  getUnreadCount(): Promise<number>;

  /**
   * Получить настройки уведомлений пользователя
   */
  getUserNotificationSettings(): Promise<UserNotificationSettings>;

  /**
   * Сохранить настройки уведомлений пользователя
   */
  saveUserNotificationSettings(settings: UserNotificationSettings): Promise<void>;

  /**
   * Получить настройки всплывающих уведомлений (тостов)
   */
  getToastSettings(): Promise<ToastSettings>;

  /**
   * Сохранить настройки всплывающих уведомлений (тостов)
   */
  saveToastSettings(settings: ToastSettings): Promise<void>;
}
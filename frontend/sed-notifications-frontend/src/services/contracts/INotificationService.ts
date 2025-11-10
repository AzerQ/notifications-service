import { InAppNotificationData } from '../../NotificationsBar/types';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  notifications: T[];
  request: {
    onlyUnread: boolean;
    pageSize: number;
    pageNumber: number;
  };
  totalItemsCount: number;
}

export interface NotificationFilters {
  onlyUnread?: boolean;
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
   * Получить уведомления пользователя с пагинацией
   * Поддерживает фильтр по непрочитанным уведомлениям
   */
  getNotifications(params: GetNotificationsParams): Promise<PaginatedResponse<InAppNotificationData>>;
  
  /**
   * Отметить уведомление как прочитанное по идентификатору
   */
  setReadFlag(notificationId: string, flagValue: boolean): Promise<void>;
}

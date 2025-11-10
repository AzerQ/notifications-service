import { Notification } from '../../models';

/**
 * CompactNotificationData is now an alias for the full Notification model
 * since SignalR sends the complete AppNotification from the backend
 */
export type CompactNotificationData = Notification;

export interface ISignalRNotificationService {
  /**
   * Запустить соединение с SignalR хабом
   */
  startConnection(): Promise<void>;
  
  /**
   * Остановить соединение с SignalR хабом
   */
  stopConnection(): Promise<void>;
  
  /**
   * Подписаться на получение новых уведомлений
   */
  onNewNotification(callback: (notification: CompactNotificationData) => void): void;
  
  /**
   * Подписаться на обновления статуса уведомлений
   */
  onNotificationStatusUpdate(callback: (notificationId: string, isRead: boolean) => void): void;
  
  /**
   * Отписаться от всех событий
   */
  offAllEvents(): void;
  
  /**
   * Проверить состояние соединения
   */
  isConnected(): boolean;
}

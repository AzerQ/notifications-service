import { InAppNotificationData } from '../../NotificationsBar/types';

export interface CompactNotificationData {
  id: number;
  title: string;
  type: string;
  subtype?: string;
  author: string;
  date: string;
  read: boolean;
  cardUrl?: string;
}

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
  onNotificationStatusUpdate(callback: (notificationId: number, isRead: boolean) => void): void;
  
  /**
   * Отписаться от всех событий
   */
  offAllEvents(): void;
  
  /**
   * Проверить состояние соединения
   */
  isConnected(): boolean;
}
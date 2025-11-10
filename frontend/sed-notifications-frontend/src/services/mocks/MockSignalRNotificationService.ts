import { 
  ISignalRNotificationService, 
  CompactNotificationData 
} from '../contracts/ISignalRNotificationService';
import { InAppNotificationData } from '../../NotificationsBar/types';

export class MockSignalRNotificationService implements ISignalRNotificationService {
  private connected = false;
  private newNotificationCallbacks: ((notification: CompactNotificationData) => void)[] = [];
  private statusUpdateCallbacks: ((notificationId: string, isRead: boolean) => void)[] = [];
  private simulationInterval: NodeJS.Timeout | null = null;

  async startConnection(): Promise<void> {
    // Симуляция задержки подключения
    await this.delay(1000 + Math.random() * 2000);
    
    this.connected = true;
    // console.log('MockSignalR: Соединение установлено');
    
    // Запускаем симуляцию случайных уведомлений
    this.startNotificationSimulation();
  }

  async stopConnection(): Promise<void> {
    this.connected = false;
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    // console.log('MockSignalR: Соединение закрыто');
  }

  onNewNotification(callback: (notification: CompactNotificationData) => void): void {
    this.newNotificationCallbacks.push(callback);
  }

  onNotificationStatusUpdate(callback: (notificationId: string, isRead: boolean) => void): void {
    this.statusUpdateCallbacks.push(callback);
  }

  offAllEvents(): void {
    this.newNotificationCallbacks = [];
    this.statusUpdateCallbacks = [];
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Методы для имитации событий (для тестирования)
  
  /**
   * Имитировать получение нового уведомления
   */
  simulateNewNotification(notification?: Partial<CompactNotificationData>): void {
    if (!this.connected) return;

    const mockNotification: CompactNotificationData = {
      id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      title: 'Новое уведомление из SignalR',
      type: 'system',
      subType: 'update',
      content: 'Новое уведомление',
      url: 'https://example.com',
      author: 'Система',
      date: new Date().toISOString(),
      read: false,
      receiverId: '',
      ...notification
    };

    this.newNotificationCallbacks.forEach(callback => {
      try {
        callback(mockNotification);
      } catch (error) {
        console.error('Ошибка в callback новых уведомлений:', error);
      }
    });
  }

  /**
   * Имитировать обновление статуса уведомления
   */
  simulateStatusUpdate(notificationId: string, isRead: boolean): void {
    if (!this.connected) return;

    this.statusUpdateCallbacks.forEach(callback => {
      try {
        callback(notificationId, isRead);
      } catch (error) {
        console.error('Ошибка в callback обновления статуса:', error);
      }
    });
  }

  private startNotificationSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    // Генерируем новые уведомления каждые 10-30 секунд
    this.simulationInterval = setInterval(() => {
      if (this.connected && Math.random() > 0.7) { // 30% вероятность
        this.simulateRandomNotification();
      }
    }, 10000); // каждые 10 секунд проверяем
  }

  private simulateRandomNotification(): void {
    const mockNotifications: Partial<CompactNotificationData>[] = [
      {
        title: 'Новый документ на согласование',
        type: 'document',
        subType: 'Входящий документ',
        content: 'Документ требует вашего согласования',
        author: 'Петров И.И.',
        url: 'https://example.com/document/123',
        icon: { name: 'file-text', cssClass: null },
        hashtags: ['document', 'approval']
      },
      {
        title: 'Напоминание о встрече',
        type: 'other',
        subType: 'Напоминание',
        content: 'Встреча начинается через 15 минут',
        author: 'Календарь',
        url: 'https://example.com/meeting/456',
        icon: { name: 'calendar', cssClass: null },
        hashtags: ['meeting', 'reminder']
      },
      {
        title: 'Обновление системы',
        type: 'system',
        subType: 'update',
        content: 'Доступно новое обновление системы',
        author: 'Система',
        url: 'https://example.com/updates',
        icon: { name: 'refresh-cw', cssClass: null },
        hashtags: ['system', 'update']
      },
      {
        title: 'Новая задача',
        type: 'task',
        subType: 'assignment',
        content: 'Вам назначена новая задача',
        author: 'Сидорова М.П.',
        url: 'https://example.com/task/789',
        icon: { name: 'bookmark-check', cssClass: null },
        hashtags: ['task', 'assignment', 'work']
      },
      {
        title: 'Требуется подпись',
        type: 'task',
        subType: 'approval',
        content: 'Документ ожидает вашей подписи',
        author: 'Козлов А.В.',
        url: 'https://example.com/approval/321',
        icon: { name: 'pen-tool', cssClass: null },
        hashtags: ['task', 'approval', 'signature']
      }
    ];

    const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
    this.simulateNewNotification(randomNotification);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Конвертер для преобразования полного уведомления в компактное
 * Теперь это просто приведение типа, так как CompactNotificationData = Notification
 */
export const convertToCompactNotification = (notification: InAppNotificationData): CompactNotificationData => {
  return notification as CompactNotificationData;
};

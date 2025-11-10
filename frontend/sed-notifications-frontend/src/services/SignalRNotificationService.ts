import * as signalR from '@microsoft/signalr';
import { 
  ISignalRNotificationService, 
  CompactNotificationData 
} from './contracts/ISignalRNotificationService';

/**
 * Real SignalR Notification Service that connects to the backend SignalR hub
 */
export class SignalRNotificationService implements ISignalRNotificationService {
  private connection: signalR.HubConnection | null = null;
  private hubUrl: string;
  private newNotificationCallbacks: ((notification: CompactNotificationData) => void)[] = [];
  private statusUpdateCallbacks: ((notificationId: number, isRead: boolean) => void)[] = [];
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;

  constructor(
    hubUrl: string,
    reconnectInterval: number = 5000,
    maxReconnectAttempts: number = 10
  ) {
    this.hubUrl = hubUrl;
    this.reconnectInterval = reconnectInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
  }

  async startConnection(): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR: Already connected');
      return;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          withCredentials: true,
          accessTokenFactory: () => {
            const token = localStorage.getItem('accessToken');
            return token || '';
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (context) => {
            if (context.previousRetryCount >= this.maxReconnectAttempts) {
              console.error('SignalR: Max reconnect attempts reached');
              return null;
            }
            return this.reconnectInterval;
          }
        })
        .withHubProtocol(new signalR.JsonHubProtocol())
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Setup event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      this.reconnectAttempts = 0;
      console.log('SignalR: Connection established');
    } catch (error) {
      console.error('SignalR: Failed to start connection:', error);
      throw error;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR: Connection closed');
      } catch (error) {
        console.error('SignalR: Error stopping connection:', error);
      }
    }
  }

  onNewNotification(callback: (notification: CompactNotificationData) => void): void {
    this.newNotificationCallbacks.push(callback);
  }

  onNotificationStatusUpdate(callback: (notificationId: number, isRead: boolean) => void): void {
    this.statusUpdateCallbacks.push(callback);
  }

  offAllEvents(): void {
    this.newNotificationCallbacks = [];
    this.statusUpdateCallbacks = [];
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Handle new notification received
    this.connection.on('ReceiveNotification', (notification: CompactNotificationData) => {
      console.log('SignalR: New notification received:', notification);
      this.newNotificationCallbacks.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('Error in new notification callback:', error);
        }
      });
    });

    // Handle notification status update
    this.connection.on('NotificationStatusUpdated', (notificationId: number, isRead: boolean) => {
      console.log(`SignalR: Notification ${notificationId} status updated to ${isRead}`);
      this.statusUpdateCallbacks.forEach(callback => {
        try {
          callback(notificationId, isRead);
        } catch (error) {
          console.error('Error in status update callback:', error);
        }
      });
    });

    // Handle connection events
    this.connection.onreconnecting((error) => {
      this.reconnectAttempts++;
      console.warn(`SignalR: Reconnecting (attempt ${this.reconnectAttempts}):`, error);
    });

    this.connection.onreconnected((connectionId) => {
      this.reconnectAttempts = 0;
      console.log('SignalR: Reconnected with connection ID:', connectionId);
    });

    this.connection.onclose((error) => {
      console.warn('SignalR: Connection closed:', error);
    });
  }
}

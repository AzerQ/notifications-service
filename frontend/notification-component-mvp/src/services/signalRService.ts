import * as signalR from '@microsoft/signalr';
import type { Notification, SignalRConfig } from '../types';

/**
 * SignalR service for real-time notifications
 */
export class SignalRNotificationService {
  private connection: signalR.HubConnection | null = null;
  private config: SignalRConfig;
  private onNotificationCallback?: (notification: Notification) => void;

  constructor(config: SignalRConfig) {
    this.config = config;
  }

  /**
   * Initialize SignalR connection
   */
  async connect(): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    const builder = new signalR.HubConnectionBuilder()
      .withUrl(this.config.hubUrl, {
        ...(this.config.accessToken && {
          accessTokenFactory: () => this.config.accessToken!
        })
      });

    if (this.config.autoReconnect !== false) {
      builder.withAutomaticReconnect();
    }

    this.connection = builder.build();

    // Set up event handlers
    this.connection.on('ReceiveNotification', (notification: Notification) => {
      if (this.onNotificationCallback) {
        this.onNotificationCallback(notification);
      }
    });

    // Handle connection events
    this.connection.onreconnecting(() => {
      console.log('SignalR: Reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR: Reconnected');
    });

    this.connection.onclose((error) => {
      console.log('SignalR: Connection closed', error);
    });

    try {
      await this.connection.start();
      console.log('SignalR: Connected successfully');
    } catch (error) {
      console.error('SignalR: Connection failed', error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        console.log('SignalR: Disconnected');
      } catch (error) {
        console.error('SignalR: Disconnect failed', error);
      }
    }
  }

  /**
   * Register callback for new notifications
   */
  onNotification(callback: (notification: Notification) => void): void {
    this.onNotificationCallback = callback;
  }

  /**
   * Get connection state
   */
  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Get connection state
   */
  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  /**
   * Update access token for authenticated connection
   */
  updateAccessToken(token: string): void {
    this.config.accessToken = token;
  }
}

/**
 * Create SignalR notification service instance
 */
export function createSignalRService(config: SignalRConfig): SignalRNotificationService {
  return new SignalRNotificationService(config);
}

import { makeAutoObservable } from 'mobx';
import * as signalR from '@microsoft/signalr';
import { notificationApi } from '../services/api';
import type { Notification } from '../types';

export class NotificationStore {
  notifications: Notification[] = [];
  connection: signalR.HubConnection | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private normalizeNotification(notification: Notification): Notification {
    // Ensure backward compatibility by creating alias fields
    return {
      ...notification,
      message: notification.content || notification.message || '',
      route: notification.type || notification.route || '',
      createdAt: notification.date || notification.createdAt || new Date().toISOString(),
    };
  }

  async loadNotifications(userId: string) {
    this.loading = true;
    this.error = null;
    try {
      const notifications = await notificationApi.getByUser(userId);
      // Normalize notifications to ensure backward compatibility
      this.notifications = notifications.map(n => this.normalizeNotification(n));
    } catch (error: any) {
      this.error = error.message || 'Failed to load notifications';
    } finally {
      this.loading = false;
    }
  }

  async initializeSignalR(_userId: string, token: string) {
    const hubUrl = import.meta.env.VITE_SIGNALR_URL || '/notificationHub';
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveNotification', (notification: Notification) => {
      console.log('Received notification:', notification);
      this.addNotification(notification);
    });

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
      this.error = 'Failed to connect to notification hub';
    }
  }

  addNotification(notification: Notification) {
    this.notifications = [this.normalizeNotification(notification), ...this.notifications];
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

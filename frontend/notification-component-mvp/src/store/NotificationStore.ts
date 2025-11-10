import { makeAutoObservable, runInAction } from 'mobx';
import type { Notification, NotificationFilters } from '../types';
import type { NotificationApiClient } from '../services/apiClient';
import type { SignalRNotificationService } from '../services/signalRService';

/**
 * MobX store for managing notification state
 */
export class NotificationStore {
  // State
  notifications: Notification[] = [];
  isLoading = false;
  error: string | null = null;
  isSignalRConnected = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 50;
  totalCount = 0;
  
  // Filters
  filters: NotificationFilters = {};
  
  // UI state
  isDropdownOpen = false;

  constructor(
    private apiClient: NotificationApiClient,
    private signalRService: SignalRNotificationService
  ) {
    makeAutoObservable(this);
    this.initialize();
  }

  /**
   * Initialize store: load notifications and connect SignalR
   */
  private async initialize(): Promise<void> {
    await Promise.all([
      this.loadNotifications(),
      this.connectSignalR()
    ]);
  }

  /**
   * Load notifications from API
   */
  async loadNotifications(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.apiClient.getNotifications({
        page: this.currentPage,
        pageSize: this.pageSize,
        filters: this.filters
      });

      runInAction(() => {
        this.notifications = response.notifications;
        this.totalCount = response.totalItemsCount;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load notifications';
        this.isLoading = false;
      });
      console.error('Failed to load notifications:', error);
    }
  }

  /**
   * Connect to SignalR for real-time updates
   */
  private async connectSignalR(): Promise<void> {
    try {
      // Register callback before connecting
      this.signalRService.onNotification(this.handleNewNotification.bind(this));
      
      await this.signalRService.connect();
      
      runInAction(() => {
        this.isSignalRConnected = true;
      });
    } catch (error) {
      console.error('Failed to connect SignalR:', error);
      runInAction(() => {
        this.isSignalRConnected = false;
      });
    }
  }

  /**
   * Handle new notification from SignalR
   */
  private handleNewNotification(notification: Notification): void {
    runInAction(() => {
      // Add to beginning of list
      this.notifications.unshift(notification);
      this.totalCount += 1;
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.apiClient.markAsRead(notificationId);
      
      runInAction(() => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId: string): Promise<void> {
    try {
      await this.apiClient.markAsUnread(notificationId);
      
      runInAction(() => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = false;
        }
      });
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await this.apiClient.markAllAsRead();
      
      runInAction(() => {
        this.notifications.forEach(notification => {
          notification.read = true;
        });
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  /**
   * Set filters and reload
   */
  setFilters(filters: NotificationFilters): void {
    this.filters = filters;
    this.currentPage = 1;
    this.loadNotifications();
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadNotifications();
  }

  /**
   * Toggle dropdown open state
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  /**
   * Open dropdown
   */
  openDropdown(): void {
    this.isDropdownOpen = true;
  }

  /**
   * Computed: unread count
   */
  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Computed: unread notifications
   */
  get unreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Computed: has unread notifications
   */
  get hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  /**
   * Reload notifications
   */
  async reload(): Promise<void> {
    await this.loadNotifications();
  }

  /**
   * Cleanup: disconnect SignalR
   */
  dispose(): void {
    this.signalRService.disconnect();
  }
}

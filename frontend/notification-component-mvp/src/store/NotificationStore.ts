import { makeAutoObservable, runInAction } from 'mobx';
import type { Notification, NotificationFilters, UserRoutePreference, UserPreferenceDto } from '../types';
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
  
  // Preferences state
  preferences: UserRoutePreference[] = [];
  isPreferencesLoading = false;
  isPreferencesModalOpen = false;

  // Flag to prevent loading when not authenticated
  private canLoad = false;

  // Callback for showing toast notifications
  private showToastCallback?: (notification: Notification) => void;

  constructor(
    private apiClient: NotificationApiClient,
    private signalRService: SignalRNotificationService
  ) {
    makeAutoObservable(this);
  }

  /**
   * Set callback for showing toast notifications
   */
  setShowToastCallback(callback?: (notification: Notification) => void): void {
    this.showToastCallback = callback;
  }

  /**
   * Initialize store: load notifications and connect SignalR
   * Call this after successful authentication
   */
  async initialize(): Promise<void> {
    this.canLoad = true;
    await Promise.all([
      this.loadNotifications(),
      this.connectSignalR()
    ]);
  }

  /**
   * Load notifications from API
   */
  async loadNotifications(): Promise<void> {
    if (!this.canLoad) {
      console.log('[NotificationStore] Skipping load - not authenticated');
      return;
    }

    console.log('[NotificationStore] Starting to load notifications...', {
      page: this.currentPage,
      pageSize: this.pageSize,
      filters: this.filters
  });

    this.isLoading = true;
    this.error = null;

    try {
const response = await this.apiClient.getNotifications({
        page: this.currentPage,
pageSize: this.pageSize,
 filters: this.filters
   });

      console.log('[NotificationStore] API response received:', {
   notificationsCount: response.notifications.length,
        totalCount: response.totalItemsCount,
        firstNotification: response.notifications[0]
 });

      runInAction(() => {
        this.notifications = response.notifications;
        this.totalCount = response.totalItemsCount;
     this.isLoading = false;
      });

      console.log('[NotificationStore] Notifications loaded successfully:', {
     storeNotificationsCount: this.notifications.length,
        storeTotalCount: this.totalCount
    });
    } catch (error) {
      console.error('[NotificationStore] Failed to load notifications:', error);
      runInAction(() => {
     this.error = error instanceof Error ? error.message : 'Failed to load notifications';
        this.isLoading = false;
      });
    }
  }

  /**
   * Connect to SignalR for real-time updates
   */
  private async connectSignalR(): Promise<void> {
    if (!this.canLoad) {
      console.log('[NotificationStore] Skipping SignalR - not authenticated');
      return;
    }

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
    console.log('[NotificationStore] New SignalR notification received:', notification);
    
    // Show toast notification if callback is set and dropdown is closed
    if (this.showToastCallback && !this.isDropdownOpen) {
      console.log('[NotificationStore] Showing toast notification');
      this.showToastCallback(notification);
    } else {
      console.log('[NotificationStore] Toast not shown:', {
        hasCallback: !!this.showToastCallback,
        isDropdownOpen: this.isDropdownOpen
      });
    }

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
    return this.notifications?.filter(n => !n.read).length ?? 0;
  }

  /**
   * Computed: unread notifications
   */
  get unreadNotifications(): Notification[] {
    return this.notifications?.filter(n => !n.read) ?? [];
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
    if (!this.canLoad) {
      console.log('[NotificationStore] Cannot reload - not authenticated');
      return;
    }
    await this.loadNotifications();
  }

  /**
   * Reset store state (on logout)
   */
  reset(): void {
    this.canLoad = false;
    this.notifications = [];
    this.isLoading = false;
    this.error = null;
    this.currentPage = 1;
    this.totalCount = 0;
    this.filters = {};
    this.isDropdownOpen = false;
    this.showToastCallback = undefined;
    
    // Disconnect SignalR
    if (this.isSignalRConnected) {
      this.signalRService.disconnect();
      this.isSignalRConnected = false;
    }
  }

  /**
    * Load user preferences
    */
  async loadPreferences(): Promise<void> {
    if (!this.canLoad) {
      console.log('[NotificationStore] Skipping preferences load - not authenticated');
      return;
    }

    this.isPreferencesLoading = true;
    this.error = null;

    try {
      const preferences = await this.apiClient.getUserPreferences();
      
      runInAction(() => {
        this.preferences = preferences;
        this.isPreferencesLoading = false;
      });

      console.log('[NotificationStore] Preferences loaded successfully:', preferences.length);
    } catch (error) {
      console.error('[NotificationStore] Failed to load preferences:', error);
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to load preferences';
        this.isPreferencesLoading = false;
      });
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: UserPreferenceDto[]): Promise<void> {
    if (!this.canLoad) {
      throw new Error('Not authenticated');
    }

    try {
      await this.apiClient.updateUserPreferences(preferences);
      
      // Reload preferences to get updated state
      await this.loadPreferences();
      
      console.log('[NotificationStore] Preferences updated successfully');
    } catch (error) {
      console.error('[NotificationStore] Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * Toggle preferences modal
   */
  togglePreferencesModal = () => {
    const newState = !this.isPreferencesModalOpen;
    
    runInAction(() => {
      this.isPreferencesModalOpen = newState;
    });
    
    // Load preferences when opening modal
    if (newState && this.preferences.length === 0) {
      this.loadPreferences();
    }
  }

  /**
   * Close preferences modal
   */
  closePreferencesModal(): void {
    this.isPreferencesModalOpen = false;
  }

  /**
   * Open preferences modal
   */
  openPreferencesModal(): void {
    this.isPreferencesModalOpen = true;
    
    // Load preferences when opening modal
    if (this.preferences.length === 0) {
      this.loadPreferences();
    }
  }

  /**
    * Cleanup: disconnect SignalR
    */
  dispose(): void {
    this.reset();
  }
}

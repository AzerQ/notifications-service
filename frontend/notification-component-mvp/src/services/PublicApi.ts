import { NotificationStore } from '../store/NotificationStore';

/**
 * Implementation of the Public API for the Notification Widget
 */
export class NotificationWidgetAPIImpl {
  private actionHandlers: Map<string, (args: Record<string, string>) => void> = new Map();
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();

  constructor(private store: NotificationStore) {}

  /**
   * Refresh the notification list
   */
  async refresh(): Promise<void> {
    await this.store.reload();
  }

  /**
   * Open the dropdown
   */
  open(): void {
    this.store.openDropdown();
  }

  /**
   * Close the dropdown
   */
  close(): void {
    this.store.closeDropdown();
  }

  /**
   * Set a new access token
   */
  setToken(token: string): void {
    // This would require updating the apiClient and signalRService
    // For now, we'll need to expose a way to update them in the store
    (this.store as any).updateToken?.(token);
  }

  /**
   * Register a handler for appaction:// protocol
   */
  registerActionHandler(
    actionName: string,
    handler: (args: Record<string, string>) => void
  ): void {
    this.actionHandlers.set(actionName, handler);
  }

  /**
   * Execute a registered action
   * @internal
   */
  executeAction(url: string): boolean {
    if (!url.startsWith('appaction://')) return false;

    try {
      const parsedUrl = new URL(url.replace('appaction://', 'http://localhost/'));
      const actionName = parsedUrl.pathname.substring(1);
      const handler = this.actionHandlers.get(actionName);

      if (handler) {
        const args: Record<string, string> = {};
        parsedUrl.searchParams.forEach((value, key) => {
          args[key] = value;
        });
        handler(args);
        this.emit('actionExecuted', { actionName, args });
        return true;
      } else {
        console.warn(`[NotificationWidget] No handler registered for action: ${actionName}`);
      }
    } catch (e) {
      console.error('[NotificationWidget] Failed to parse action URL:', e);
    }
    return false;
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  /**
   * Emit an event
   * @internal
   */
  emit(event: string, data: any): void {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }
}

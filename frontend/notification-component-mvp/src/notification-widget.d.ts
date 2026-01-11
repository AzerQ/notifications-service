/**
 * Public API for the Notification Widget
 */
export interface NotificationWidgetAPI {
  /**
   * Refresh the notification list from the server
   */
  refresh(): Promise<void>;

  /**
   * Programmatically open the notification dropdown
   */
  open(): void;

  /**
   * Programmatically close the notification dropdown
   */
  close(): void;

  /**
   * Update the JWT access token dynamically
   * @param token New JWT token
   */
  setToken(token: string): void;

  /**
   * Register a handler for custom actions with appaction:// protocol
   * @param actionName Name of the action (e.g., 'taskAccept')
   * @param handler Callback function receiving arguments as string record
   */
  registerActionHandler(
    actionName: string,
    handler: (args: Record<string, string>) => void
  ): void;

  /**
   * Subscribe to widget events
   * @param event Event name
   * @param callback Callback function
   */
  on(event: 'newNotification' | 'actionExecuted' | 'dropdownToggle', callback: (data: any) => void): void;
}

declare global {
  interface Window {
    /**
     * Global instance of the Notification Widget API
     */
    NotificationWidget: NotificationWidgetAPI;
  }
}

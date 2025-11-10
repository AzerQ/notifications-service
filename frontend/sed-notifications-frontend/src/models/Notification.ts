/**
 * Notification model matching backend AppNotification structure
 * Backend is the source of truth
 */

/**
 * Notification action link
 * Matches backend NotificationAction record
 */
export interface NotificationAction {
  name: string;
  label: string;
  url: string;
}

/**
 * Additional parameter for notification with key-value-description structure
 * Matches backend NotificationParameter record
 */
export interface NotificationParameter {
  key: string;
  value: string;
  description: string;
}

/**
 * Icon for notification
 * Matches backend Icon record: public record Icon (string Name, string? CssClass = null);
 */
export interface Icon {
  name: string;
  cssClass?: string | null;
}

/**
 * Notification model matching backend AppNotification
 * This is the primary model used throughout the frontend
 */
export interface Notification {
  // Required fields
  id: string; // Guid from backend
  receiverId: string;
  type?: string;
  subType?: string;
  title: string;
  content: string;
  url: string;
  date: string; // DateTime from backend
  read: boolean;

  // Optional fields
  icon?: Icon;
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
  
  // Additional fields for extended functionality
  description?: string;
  cardUrl?: string;
  starred?: boolean;
  delegate?: boolean;
  subtype?: string; // Alias for subType for backward compatibility
}

// Type aliases for backward compatibility
export type BaseNotification = Notification;
export type ExtendedNotification = Notification;

// Helper functions for backward compatibility
export function isBaseNotification(obj: any): obj is Notification {
  return isNotification(obj);
}

export function toBaseNotification(obj: any): Notification {
  return obj as Notification;
}

export function toExtendedNotification(obj: any): Notification {
  return obj as Notification;
}

/**
 * Type guard to check if an object is a Notification
 */
export function isNotification(obj: any): obj is Notification {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return (
    (typeof obj.id === 'string') &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.read === 'boolean'
  );
}

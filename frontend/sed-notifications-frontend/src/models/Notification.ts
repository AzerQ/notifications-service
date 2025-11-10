/**
 * Base notification model for universal notification system
 * Following Backend for Frontend (BFF) paradigm
 */

/**
 * Notification action link
 */
export interface NotificationAction {
  name: string;
  label: string;
  url: string;
}

/**
 * Additional parameter for notification with key-value-description structure
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
 * Base notification interface with required and optional fields
 */
export interface BaseNotification {
  // Required fields
  id: number | string;
  type: string;
  title: string;
  content: string;
  date: string;
  read: boolean;

  // Optional fields
  icon?: Icon;
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
}

/**
 * Extended notification with backward compatibility fields
 */
export interface ExtendedNotification extends BaseNotification {
  // Backward compatibility fields
  subtype?: string;
  description?: string; // Alias for content
  starred?: boolean;
  cardUrl?: string;
  delegate?: boolean;
}

/**
 * Type guard to check if a notification is BaseNotification
 */
export function isBaseNotification(obj: any): obj is BaseNotification {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  return (
    (typeof obj.id === 'number' || typeof obj.id === 'string') &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.read === 'boolean'
  );
}

/**
 * Helper to convert old notification format to new base format
 */
export function toBaseNotification(oldNotification: any): BaseNotification {
  return {
    id: oldNotification.id,
    type: oldNotification.type,
    title: oldNotification.title,
    content: oldNotification.description || oldNotification.content || '',
    date: oldNotification.date,
    read: oldNotification.read,
    icon: oldNotification.icon,
    author: oldNotification.author,
    actions: oldNotification.actions,
    hashtags: oldNotification.hashtags,
    parameters: oldNotification.parameters
  };
}

/**
 * Helper to convert base notification to extended format with backward compatibility
 */
export function toExtendedNotification(baseNotification: BaseNotification, additionalFields?: Partial<ExtendedNotification>): ExtendedNotification {
  return {
    ...baseNotification,
    description: baseNotification.content, // Alias for backward compatibility
    ...additionalFields
  };
}

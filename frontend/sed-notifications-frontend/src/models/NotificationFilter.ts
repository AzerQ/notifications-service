/**
 * Dynamic filter system for notifications
 * Supports filtering by any field without hardcoded filters
 */

import { BaseNotification, NotificationParameter } from './Notification';

/**
 * Filter operator types
 */
export type FilterOperator = 
  | 'equals'          // Exact match
  | 'contains'        // Contains substring (case-insensitive)
  | 'startsWith'      // Starts with (case-insensitive)
  | 'endsWith'        // Ends with (case-insensitive)
  | 'greaterThan'     // Greater than (for dates and numbers)
  | 'lessThan'        // Less than (for dates and numbers)
  | 'in'              // Value in array
  | 'exists';         // Field exists (for optional fields)

/**
 * Filter condition for a single field
 */
export interface FilterCondition {
  field: keyof BaseNotification | string; // Support nested fields like 'parameters.key'
  operator: FilterOperator;
  value?: any;
}

/**
 * Complex filter with multiple conditions
 */
export interface NotificationFilter {
  conditions: FilterCondition[];
  logic?: 'AND' | 'OR'; // How to combine conditions (default: AND)
}

/**
 * Apply a single filter condition to a notification
 */
function applyCondition(notification: BaseNotification, condition: FilterCondition): boolean {
  const { field, operator, value } = condition;
  
  // Handle nested fields (e.g., 'parameters.key')
  const fieldValue = getNestedValue(notification, field as string);
  
  switch (operator) {
    case 'equals':
      return fieldValue === value;
      
    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(String(value).toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(item => 
          String(item).toLowerCase().includes(String(value).toLowerCase())
        );
      }
      return false;
      
    case 'startsWith':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().startsWith(String(value).toLowerCase());
      }
      return false;
      
    case 'endsWith':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().endsWith(String(value).toLowerCase());
      }
      return false;
      
    case 'greaterThan':
      if (field === 'date') {
        return new Date(fieldValue as string) > new Date(value);
      }
      return fieldValue > value;
      
    case 'lessThan':
      if (field === 'date') {
        return new Date(fieldValue as string) < new Date(value);
      }
      return fieldValue < value;
      
    case 'in':
      if (Array.isArray(value)) {
        return value.includes(fieldValue);
      }
      return false;
      
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
      
    default:
      return false;
  }
}

/**
 * Get nested value from object by path (e.g., 'parameters.0.key')
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Apply a filter to a notification
 */
export function applyFilter(notification: BaseNotification, filter: NotificationFilter): boolean {
  if (!filter.conditions || filter.conditions.length === 0) {
    return true; // No filter = pass all
  }
  
  const logic = filter.logic || 'AND';
  
  if (logic === 'AND') {
    return filter.conditions.every(condition => applyCondition(notification, condition));
  } else {
    return filter.conditions.some(condition => applyCondition(notification, condition));
  }
}

/**
 * Apply multiple filters to notifications
 */
export function filterNotifications(
  notifications: BaseNotification[],
  filters: NotificationFilter[]
): BaseNotification[] {
  if (!filters || filters.length === 0) {
    return notifications;
  }
  
  return notifications.filter(notification => 
    filters.every(filter => applyFilter(notification, filter))
  );
}

/**
 * Helper function to create a simple filter
 */
export function createSimpleFilter(
  field: keyof BaseNotification | string,
  operator: FilterOperator,
  value?: any
): NotificationFilter {
  return {
    conditions: [{ field, operator, value }],
    logic: 'AND'
  };
}

/**
 * Helper to create filter for type
 */
export function filterByType(type: string): NotificationFilter {
  return createSimpleFilter('type', 'equals', type);
}

/**
 * Helper to create filter for author
 */
export function filterByAuthor(author: string): NotificationFilter {
  return createSimpleFilter('author', 'contains', author);
}

/**
 * Helper to create filter for hashtags
 */
export function filterByHashtag(hashtag: string): NotificationFilter {
  return createSimpleFilter('hashtags', 'contains', hashtag);
}

/**
 * Helper to create filter for date range
 */
export function filterByDateRange(from?: string, to?: string): NotificationFilter {
  const conditions: FilterCondition[] = [];
  
  if (from) {
    conditions.push({ field: 'date', operator: 'greaterThan', value: from });
  }
  
  if (to) {
    conditions.push({ field: 'date', operator: 'lessThan', value: to });
  }
  
  return {
    conditions,
    logic: 'AND'
  };
}

/**
 * Helper to create filter for read status
 */
export function filterByReadStatus(read: boolean): NotificationFilter {
  return createSimpleFilter('read', 'equals', read);
}

/**
 * Helper to create filter for notifications with specific parameter
 */
export function filterByParameter(key: string, value?: string): NotificationFilter {
  if (value) {
    return {
      conditions: [
        {
          field: 'parameters',
          operator: 'contains',
          value: { key, value }
        }
      ],
      logic: 'AND'
    };
  }
  
  return {
    conditions: [
      {
        field: 'parameters',
        operator: 'exists',
        value: undefined
      }
    ],
    logic: 'AND'
  };
}

/**
 * Search notifications by text (searches in title, content, author)
 */
export function searchNotifications(
  notifications: BaseNotification[],
  searchText: string
): BaseNotification[] {
  if (!searchText || searchText.trim() === '') {
    return notifications;
  }
  
  const searchLower = searchText.toLowerCase();
  
  return notifications.filter(notification => {
    // Search in title
    if (notification.title.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in content
    if (notification.content.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in author
    if (notification.author && notification.author.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in hashtags
    if (notification.hashtags && notification.hashtags.some(tag => 
      tag.toLowerCase().includes(searchLower)
    )) {
      return true;
    }
    
    // Search in parameters
    if (notification.parameters && notification.parameters.some(param =>
      param.key.toLowerCase().includes(searchLower) ||
      param.value.toLowerCase().includes(searchLower) ||
      param.description.toLowerCase().includes(searchLower)
    )) {
      return true;
    }
    
    return false;
  });
}

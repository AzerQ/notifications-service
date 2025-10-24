// Import base notification model
import { 
    BaseNotification, 
    ExtendedNotification,
    NotificationAction as BaseNotificationAction,
    NotificationParameter
} from '../models';

// Типы данных
export type NotificationType = 'document' | 'task' | 'system' | 'other';
export type NotificationSubtype = string;

export interface ToastConfig {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    actionUrl?: string;
}

export interface Toast extends ToastConfig {
    id: number;
}

export interface Filters {
    type: string;
    subtype: string;
    status: string;
    author: string;
}

export interface Preset {
    name: string;
    filters: Filters & { search: string };
}

export interface SortOption {
    field: 'date' | 'title' | 'author' | 'type';
    order: 'asc' | 'desc';
}

// Re-export NotificationAction for backward compatibility
export interface NotificationAction extends BaseNotificationAction {}

// Export NotificationParameter for use in components
export type { NotificationParameter };

// InAppNotificationData now extends ExtendedNotification for full compatibility
export interface InAppNotificationData extends ExtendedNotification {
    // Override id to be number only (backward compatibility)
    id: number;
    // Override type to use the specific NotificationType
    type: NotificationType;
    // Make subtype required for backward compatibility
    subtype: NotificationSubtype;
    // Make description alias for content
    description: string;
    // Make content from base notification also available
    content: string;
    // Make author required for backward compatibility
    author: string;
    // Make actions required for backward compatibility
    actions: NotificationAction[];
    // Additional fields for backward compatibility
    starred: boolean;
    delegate: boolean;
    // Optional new fields with defaults
    hashtags?: string[];
    parameters?: NotificationParameter[];
}

// Типы для настроек уведомлений
export type NotificationChannel = 'email' | 'sms' | 'push' | 'inApp';
export type NotificationSettingGroup = 'personal' | 'substitute';

export interface ChannelSetting {
    channel: NotificationChannel;
    enabled: boolean;
}

export interface NotificationEventSetting {
    eventId: string; // Текстовый идентификатор события
    eventName: string; // Человекопонятное наименование
    eventDescription?: string; // Описание события
    personalSettings: ChannelSetting[]; // Настройки для себя
    substituteSettings: ChannelSetting[]; // Настройки по замещению
}

export interface UserNotificationSettings {
    userId: string;
    eventSettings: NotificationEventSetting[];
    lastUpdated: string;
}

// Типы для настроек всплывающих уведомлений (тостов)
export type ToastSize = 'small' | 'medium' | 'large';
export type ToastPosition = 'top' | 'bottom';

export interface ToastSettings {
    size: ToastSize;
    duration: number; // в секундах
    position: ToastPosition;
}

export const DEFAULT_TOAST_SETTINGS: ToastSettings = {
    size: 'medium',
    duration: 4,
    position: 'bottom'
};


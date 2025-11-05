// Main library entry point
export { NotificationsStore } from './store/NotificationsStore';
export { useSignalRConnection } from './hooks/useSignalRConnection';
export { default as NotificationBell } from './NotificationsBar/NotificationBell';
export { default as NotificationList } from './NotificationsBar/NotificationList';
export { default as NotificationItem } from './NotificationsBar/NotificationItem';
// Export all notification types
export type { 
  BaseNotification, 
  ExtendedNotification,
  NotificationAction,
  NotificationParameter 
} from './models/Notification';
export { isBaseNotification, toBaseNotification, toExtendedNotification } from './models/Notification';

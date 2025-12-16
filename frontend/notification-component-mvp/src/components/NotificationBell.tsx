import React from 'react';
import { observer } from 'mobx-react-lite';
import { Bell } from 'lucide-react';
import type { NotificationStore } from '../store/NotificationStore';
import {config} from "../index.ts";
import styles from './NotificationBell.module.css';

interface NotificationBellProps {
  store: NotificationStore;
  onClick?: () => void;
  className?: string;
}

/**
 * Simple notification bell icon with unread count badge
 */
export const NotificationBell: React.FC<NotificationBellProps> = observer(({ 
  store, 
  onClick,
  className = '' 
}) => {
  const handleClick = () => {
    store.toggleDropdown();
    onClick?.();
  };

  const iconClass = config.iconsTheme === "dark" ? styles.iconDark : styles.iconLight;

  return (
    <button
      onClick={handleClick}
      className={`${styles.bellButton} ${className}`}
      aria-label="Уведомления"
      title="Уведомления"
      data-testid="notification-bell"
    >
      <Bell className={`${styles.icon} ${iconClass}`} />
      
      {store.hasUnread && (
        <span 
          className={styles.badge}
          data-testid="notification-badge"
        >
          {store.unreadCount > 99 ? '99+' : store.unreadCount}
        </span>
      )}
    </button>
  );
});

NotificationBell.displayName = 'NotificationBell';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Bell } from 'lucide-react';
import type { NotificationStore } from '../store/NotificationStore';

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

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      aria-label="Уведомления"
      data-testid="notification-bell"
    >
      <Bell className="w-6 h-6 text-gray-700" />
      
      {store.hasUnread && (
        <span 
          className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
          data-testid="notification-badge"
        >
          {store.unreadCount > 99 ? '99+' : store.unreadCount}
        </span>
      )}
    </button>
  );
});

NotificationBell.displayName = 'NotificationBell';

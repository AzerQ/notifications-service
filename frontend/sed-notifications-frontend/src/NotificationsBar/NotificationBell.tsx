import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`Открыть центр уведомлений${unreadCount > 0 ? ` (${unreadCount} непрочитанных)` : ''}`}
      data-testid="notification-bell"
    >
      <Bell className="w-6 h-6 text-gray-700" data-testid="notification-bell-icon" />
      {unreadCount > 0 && (
        <span 
          className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px] h-5"
          data-testid="notification-bell-badge"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
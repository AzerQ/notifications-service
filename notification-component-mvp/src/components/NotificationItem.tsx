import React from 'react';
import { observer } from 'mobx-react-lite';
import { Bell, ExternalLink, Check, X } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

/**
 * Single notification item component
 */
export const NotificationItem: React.FC<NotificationItemProps> = observer(({ 
  notification, 
  onMarkAsRead,
  onMarkAsUnread,
  onClick 
}) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
    
    // Navigate to URL if provided
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read) {
      onMarkAsUnread(notification.id);
    } else {
      onMarkAsRead(notification.id);
    }
  };

  const getIcon = () => {
    if (notification.icon) {
      // Use backend-provided icon with custom class if available
      return (
        <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 ${notification.icon.cssClass || ''}`}>
          <span className="text-lg">{notification.icon.name}</span>
        </div>
      );
    }
    
    // Default bell icon
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
        <Bell className="w-5 h-5 text-blue-600" />
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      data-testid="notification-item"
      data-read={notification.read}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {notification.title}
            </h4>
            
            {/* Read/Unread toggle */}
            <button
              onClick={handleToggleRead}
              className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
              aria-label={notification.read ? 'Mark as unread' : 'Mark as read'}
              data-testid="notification-toggle-read"
            >
              {notification.read ? (
                <X className="w-4 h-4 text-gray-500" />
              ) : (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.content}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </span>
            
            {notification.category && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {notification.category}
                </span>
              </>
            )}
            
            {notification.url && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Bell, ExternalLink, Check, X } from 'lucide-react';
import type { Notification } from '../types';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';

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
              <DynamicIcon name={notification.icon.name as IconName}/>
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

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins}м назад`;
    if (diffHours < 24) return `${diffHours}ч назад`;
    if (diffDays < 7) return `${diffDays}д назад`;
    
    return date.toLocaleDateString();
  };

  // Support both new (date, type) and legacy (createdAt, category) field names
  const displayDate = notification.date || notification.createdAt || new Date().toISOString();
  const displayType = notification.type || notification.category;
  const displaySubType = notification.subType;

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
            <div className="flex-1 min-w-0">
              {/* Type and Subtype badges */}
              <div className="flex items-center gap-2 mb-1">
                {displayType && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {displayType}
                  </span>
                )}
                {displaySubType && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {displaySubType}
                  </span>
                )}
              </div>
   
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {notification.title}
              </h4>
            </div>
            
            {/* Read/Unread toggle */}
            <button
              onClick={handleToggleRead}
              className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
              aria-label={notification.read ? 'Отметить как непрочитанное' : 'Отметить как прочитанное'}
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

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">
              {formatDate(displayDate)}
            </span>
            
            {notification.author && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {notification.author}
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

          {/* Hashtags */}
          {notification.hashtags && notification.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {notification.hashtags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

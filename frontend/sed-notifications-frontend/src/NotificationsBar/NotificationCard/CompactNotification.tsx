import React from 'react';
import { InAppNotificationData, ToastSize } from '../types';
import { getNotificationIcon, formatRelativeTime } from '../../utils/notificationUtils';

interface CompactNotificationProps {
  notification: InAppNotificationData;
  onRead: (id: string) => void;
  size?: ToastSize;
  disableClick?: boolean; // Отключить встроенный обработчик клика (для toast)
}

export const CompactNotification: React.FC<CompactNotificationProps> = ({ 
  notification, 
  onRead,
  size = 'medium',
  disableClick = false
}) => {
  const handleClick = () => {
    // Если отключен встроенный клик (например, в toast), не выполняем действия
    if (disableClick) {
      return;
    }
    
    // Если есть ссылка, открываем её
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
    
    // Помечаем как прочитанное
    onRead(notification.id);
  };

  // Определяем классы размера для текста
  const sizeClasses = {
    small: {
      title: 'text-xs',
      description: 'text-[10px]',
      footer: 'text-[10px]',
      padding: 'p-2',
      spacing: 'space-x-2',
      iconSize: 'sm' as const
    },
    medium: {
      title: 'text-sm',
      description: 'text-xs',
      footer: 'text-xs',
      padding: 'p-3',
      spacing: 'space-x-3',
      iconSize: 'md' as const
    },
    large: {
      title: 'text-base',
      description: 'text-sm',
      footer: 'text-sm',
      padding: 'p-4',
      spacing: 'space-x-4',
      iconSize: 'lg' as const
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={disableClick ? undefined : handleClick}
      className={`
        ${currentSize.padding} border-b border-gray-100 ${disableClick ? '' : 'hover:bg-gray-50 cursor-pointer'} transition-colors duration-150
        ${!disableClick && notification.url ? 'hover:bg-blue-50' : ''}
      `}
      data-testid="compact-notification"
      data-notification-id={notification.id}
      data-notification-type={notification.type}
      data-notification-subtype={notification.subType}
      data-size={size}
    >
      <div className={`flex items-start ${currentSize.spacing}`}>
        {/* Иконка типа */}
        <div className="mt-0.5" data-testid="compact-notification-icon">
          {getNotificationIcon(notification.type || '', notification.subType || '', currentSize.iconSize, notification.icon)}
        </div>
        
        {/* Содержимое */}
        <div className="flex-1 min-w-0" data-testid="compact-notification-content">
          <p className={`${currentSize.title} font-medium text-gray-900 truncate`} data-testid="compact-notification-title">
            {notification.title}
          </p>
          <p className={`${currentSize.description} text-gray-600 line-clamp-2 mt-1`} data-testid="compact-notification-description">
            {notification.content}
          </p>
          <div className={`flex items-center justify-between mt-2`} data-testid="compact-notification-footer">
            <span className={`${currentSize.footer} text-gray-500`} data-testid="compact-notification-time">
              {formatRelativeTime(notification.date)}
            </span>
            {notification.url && (
              <span className={`${currentSize.footer} text-blue-600 font-medium`} data-testid="compact-notification-link-indicator">
                Открыть →
              </span>
            )}
          </div>
        </div>
        
        {/* Индикатор непрочитанного */}
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" data-testid="compact-notification-unread-indicator"></div>
        )}
      </div>
    </div>
  );
};
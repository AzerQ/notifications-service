import React, { useEffect } from 'react';
import { X, Bell, History, Settings } from 'lucide-react';
import { InAppNotificationData, ToastSize } from './types';
import { CompactNotification } from './NotificationCard/CompactNotification';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotificationData[];
  onNotificationRead: (id: string) => void;
  onOpenFullHistory: () => void;
  onOpenSettings?: () => void;
  onOpenToastSettings?: () => void;
  markAllAsRead: () => void;
  isLoading?: boolean; // Добавляем опциональный пропс для индикации загрузки
  toastSize?: ToastSize; // Размер для компактных уведомлений
}

export const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationRead,
  onOpenFullHistory,
  onOpenSettings,
  onOpenToastSettings,
  markAllAsRead,
  isLoading = false,
  toastSize = 'medium'
}) => {
  const unreadNotifications = notifications.filter(n => !n.read);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleFullHistoryClick = () => {
    onClose(); // Закрываем боковое меню
    onOpenFullHistory(); // Открываем полную историю
  };

  // Определяем ширину сайдбара в зависимости от размера
  const sidebarWidths = {
    small: 'w-64',   // 256px - компактный
    medium: 'w-80',  // 320px - стандартный
    large: 'w-96'    // 384px - широкий
  };

  // Определяем размеры текста и элементов
  const sidebarStyles = {
    small: {
      headerIcon: 'w-4 h-4',
      headerTitle: 'text-base',
      buttonText: 'text-xs',
      buttonPadding: 'p-2',
      buttonIcon: 'w-4 h-4',
      padding: 'p-3'
    },
    medium: {
      headerIcon: 'w-5 h-5',
      headerTitle: 'text-lg',
      buttonText: 'text-sm',
      buttonPadding: 'p-2.5',
      buttonIcon: 'w-5 h-5',
      padding: 'p-4'
    },
    large: {
      headerIcon: 'w-6 h-6',
      headerTitle: 'text-xl',
      buttonText: 'text-base',
      buttonPadding: 'p-3',
      buttonIcon: 'w-6 h-6',
      padding: 'p-5'
    }
  };

  const sidebarWidth = sidebarWidths[toastSize];
  const styles = sidebarStyles[toastSize];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="notification-sidebar-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
        onClick={onClose}
        data-testid="notification-sidebar-backdrop"
      />
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full ${sidebarWidth} bg-white shadow-xl transform transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `} data-testid="notification-sidebar" data-size={toastSize}>
        {/* Header */}
        <div className={`flex items-center justify-between ${styles.padding} border-b border-gray-200 bg-gray-50 flex-shrink-0`} data-testid="notification-sidebar-header">
          <div className="flex items-center space-x-2">
            <Bell className={`${styles.headerIcon} text-gray-700`} />
            <h2 className={`${styles.headerTitle} font-semibold text-gray-900`} data-testid="notification-sidebar-title">
              Новые уведомления
            </h2>
            {unreadNotifications.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full" data-testid="notification-sidebar-unread-count">
                {unreadNotifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Закрыть панель уведомлений"
            data-testid="notification-sidebar-close-button"
          >
            <X className={`${styles.headerIcon} text-gray-500`} />
          </button>
        </div>

        {/* Action Buttons - Compact Icons with Tooltips */}
        <div className={`${styles.padding} border-b border-gray-200 flex-shrink-0`} data-testid="notification-sidebar-actions-section">
          <div className="flex items-center justify-center gap-2">
            {/* Full History Button */}
            <div className="relative group">
              <button
                onClick={handleFullHistoryClick}
                className={`${styles.buttonPadding} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                data-testid="notification-sidebar-full-history-button"
                aria-label="Вся история уведомлений"
              >
                <History className={styles.buttonIcon} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Вся история уведомлений
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            
            {/* Settings Button */}
            <div className="relative group">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings?.();
                }}
                className={`${styles.buttonPadding} bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors`}
                data-testid="notification-sidebar-settings-button"
                aria-label="Настройки уведомлений"
              >
                <Settings className={styles.buttonIcon} />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Настройки уведомлений
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            
            {/* Toast Settings Button */}
            {onOpenToastSettings && (
              <div className="relative group">
                <button
                  onClick={() => {
                    onClose();
                    onOpenToastSettings();
                  }}
                  className={`${styles.buttonPadding} bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors`}
                  data-testid="notification-sidebar-toast-settings-button"
                  aria-label="Настройки всплывающих"
                >
                  <Bell className={styles.buttonIcon} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Настройки всплывающих
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin" data-testid="notification-sidebar-content">
          {isLoading ? (
            <div className={`flex flex-col items-center justify-center h-full text-center ${styles.padding} py-8`} data-testid="notification-sidebar-loading">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className={`text-gray-500 ${styles.buttonText}`}>Загрузка уведомлений...</p>
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full text-center ${styles.padding} py-8`} data-testid="notification-sidebar-empty-state">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className={`${styles.headerIcon} text-gray-400`} />
              </div>
              <h3 className={`${styles.headerTitle} font-medium text-gray-900 mb-2`}>
                Все прочитано!
              </h3>
              <p className={`text-gray-500 ${styles.buttonText}`}>
                У вас нет новых уведомлений. Проверьте полную историю для просмотра всех уведомлений.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100" data-testid="notification-sidebar-list">
              {unreadNotifications.map(notification => (
                <CompactNotification
                  key={notification.id}
                  notification={notification}
                  onRead={onNotificationRead}
                  size={toastSize}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {unreadNotifications.length > 0 && (
          <div className={`${styles.padding} border-t border-gray-200 bg-gray-50 flex-shrink-0`} data-testid="notification-sidebar-footer">
            <button
              onClick={() => {
                markAllAsRead();
              }}
              className={`w-full ${styles.buttonText} text-gray-600 hover:text-gray-800 transition-colors`}
              data-testid="notification-sidebar-mark-all-read-button"
            >
              Отметить все как прочитанные
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
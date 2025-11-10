import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { NotificationBell } from './NotificationBell';
import { Modal } from './Modal';
import { NotificationSidebar } from './NotificationSidebar';
import { NotificationsBar } from './NotificationsBar';
import { useNotificationStore } from '../store/NotificationStoreContext';
import { InAppNotificationData } from './types';
import { useAuth } from '../hooks/useAuth';
import { loadServiceConfig } from '../config/serviceConfig';

interface NotificationCenterProps {
  // Для обратной совместимости
  notifications?: InAppNotificationData[];
  onNotificationUpdate?: (notifications: InAppNotificationData[]) => void;
}

export const NotificationCenterWithStore: React.FC<NotificationCenterProps> = observer(({
  notifications: legacyNotifications,
  onNotificationUpdate
}) => {
  const store = useNotificationStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const config = loadServiceConfig();
  
  // Инициализация хука авторизации
  const auth = useAuth({
    apiConfig: {
      baseUrl: config.apiBaseUrl,
      onUnauthenticated: () => {
        store.setShowAuthForm(true);
        store.setAuthError('Требуется авторизация');
      }
    },
    onAuthSuccess: (tokens) => {
      store.setAuthenticated(true, auth.authMethod || 'email');
      // После успешной авторизации загружаем уведомления
      store.loadNotifications({ filters: { onlyUnread: true } });
    },
    onAuthError: (error) => {
      store.setAuthError(error);
    }
  });

  // Инициализация при первом рендере
  useEffect(() => {
    if (auth.isAuthenticated) {
      store.setAuthenticated(true, auth.authMethod || undefined);
      store.initializeNotifications();
    }
  }, [auth.isAuthenticated, auth.authMethod, store]);

  // Синхронизация с legacy props (для обратной совместимости)
  useEffect(() => {
    if (legacyNotifications && onNotificationUpdate) {
      // Если используются legacy props, обновляем внешнее состояние при изменениях в store
      onNotificationUpdate(store.notifications);
    }
  }, [store.notifications, legacyNotifications, onNotificationUpdate]);

  const handleBellClick = () => {
    setIsSidebarOpen(true);
    store.setSidebarOpen(true); // Уведомляем store
    
    // Если пользователь не авторизован, показываем форму авторизации
    if (!auth.isAuthenticated) {
      store.setShowAuthForm(true);
    }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    store.setSidebarOpen(false); // Уведомляем store
  };

  const handleOpenFullHistory = () => {
    setIsSidebarOpen(false);
    store.setSidebarOpen(false); // Уведомляем store
    setIsModalOpen(true);
    store.setModalOpen(true); // Уведомляем store
    // Загружаем все уведомления при открытии полной истории
    store.reloadNotifications();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    store.setModalOpen(false); // Уведомляем store
  };


  return (
    <>
      {/* Колокольчик */}
      <NotificationBell 
        unreadCount={store.unreadCount} 
        onClick={handleBellClick}
      />

      {/* Боковая панель с компактными уведомлениями */}
      <NotificationSidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        onOpenFullHistory={handleOpenFullHistory}
        toastSize="medium"
        onAuthSuccess={auth.handleEmailAuthSuccess}
        onAuthError={auth.handleEmailAuthError}
      />

      {/* Модальное окно с полной историей */}
      <Modal size='full' isOpen={isModalOpen} onClose={handleModalClose}>
        <NotificationsBar
          showFilters={true}
          showSearch={true}
          showPagination={true}
        />
      </Modal>

      {/* Индикатор состояния SignalR (для разработки) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${store.isSignalRConnected 
              ? 'bg-green-100 text-green-800' 
              : store.isConnectingSignalR 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }
          `}>
            SignalR: {
              store.isSignalRConnected 
                ? 'Подключен' 
                : store.isConnectingSignalR 
                  ? 'Подключение...' 
                  : 'Отключен'
            }
          </div>
        </div>
      )}
    </>
  );
});

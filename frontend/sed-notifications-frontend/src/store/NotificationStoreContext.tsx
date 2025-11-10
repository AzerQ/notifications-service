import React, { createContext, useContext, ReactNode } from 'react';
import { NotificationStore } from './NotificationStore';
import { loadServiceConfig, createNotificationService, createSignalRService } from '../config/serviceConfig';

// Load configuration from environment variables
const serviceConfig = loadServiceConfig();

// Log configuration in debug mode
if (serviceConfig.debugMode) {
  console.log('[NotificationStoreContext] Service configuration:', {
    mode: serviceConfig.mode,
    apiBaseUrl: serviceConfig.apiBaseUrl,
    signalRHubUrl: serviceConfig.signalRHubUrl,
    enableSignalR: serviceConfig.enableSignalR,
    enableAutoRefresh: serviceConfig.enableAutoRefresh
  });
}

// Создаем экземпляры сервисов на основе конфигурации
const notificationService = createNotificationService(serviceConfig);
const signalRService = createSignalRService(serviceConfig);

// Создаем store
const notificationStore = new NotificationStore(notificationService, signalRService);

// Создаем контекст
const NotificationStoreContext = createContext<NotificationStore | null>(null);

// Провайдер
interface NotificationStoreProviderProps {
  children: ReactNode;
}

export const NotificationStoreProvider: React.FC<NotificationStoreProviderProps> = ({ 
  children 
}) => {
  return (
    <NotificationStoreContext.Provider value={notificationStore}>
      {children}
    </NotificationStoreContext.Provider>
  );
};

// Хук для использования store
export const useNotificationStore = (): NotificationStore => {
  const store = useContext(NotificationStoreContext);
  if (!store) {
    throw new Error('useNotificationStore must be used within NotificationStoreProvider');
  }
  return store;
};

// Экспорт для прямого доступа (если нужно)
export { notificationStore, notificationService, signalRService };
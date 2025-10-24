import React, { createContext, useContext, ReactNode } from 'react';
import { NotificationStore } from './NotificationStore';
import { MockNotificationService } from '../services/mocks/MockNotificationService';
import { MockSignalRNotificationService } from '../services/mocks/MockSignalRNotificationService';

// Создаем экземпляры сервисов
const notificationService = new MockNotificationService();
const signalRService = new MockSignalRNotificationService();

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
import React, { createContext, useContext, ReactNode } from 'react';
import type { NotificationStore } from '../store/NotificationStore';
import type { UseAuthenticationReturn } from '../hooks/useAuthentication';

/**
 * Notification context interface
 */
interface NotificationContextValue {
  store: NotificationStore;
  authentication: UseAuthenticationReturn;
  isStoreInitialized: boolean;
}

/**
 * Notification context
 */
const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * Props for NotificationProvider
 */
interface NotificationProviderProps {
  children: ReactNode;
  value: NotificationContextValue;
}

/**
 * Provider component for notification context
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  value
}) => {
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notification context
 */
export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotificationContext must be used within a NotificationProvider'
    );
  }

  return context;
};
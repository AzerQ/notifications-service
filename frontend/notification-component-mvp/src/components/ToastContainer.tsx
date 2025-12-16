import React, { useState, useCallback } from 'react';
import { Toast } from './Toast';
import type { Notification } from '../types';
import styles from './ToastContainer.module.css';

interface ToastItem {
  id: string;
  notification: Notification;
}

/**
 * Toast container for managing multiple toast notifications
 * Displays toasts in a stacked column layout
 */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((notification: Notification) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    console.log('[ToastContainer] Adding toast:', { id, notification });
    setToasts((prev) => [...prev, { id, notification }]);
  }, []);

  const removeToast = useCallback((id: string) => {
  console.log('[ToastContainer] Removing toast:', id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Expose addToast method globally for store to use
  React.useEffect(() => {
    (window as any).__showNotificationToast = addToast;
    console.log('[ToastContainer] Global toast function registered');
    
    return () => {
      delete (window as any).__showNotificationToast;
      console.log('[ToastContainer] Global toast function unregistered');
    };
  }, [addToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div 
      className={styles.container}
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <div
       key={toast.id}
        className={styles.toastWrapper}
        data-testid={`toast-wrapper-${toast.id}`}
 >
          <Toast
            notification={toast.notification}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

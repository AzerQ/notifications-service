import React, { useState } from 'react';
import { NotificationBell } from './NotificationBell';
import { Modal } from './Modal';
import { NotificationSidebar } from './NotificationSidebar';
import { NotificationsBar } from './NotificationsBar';
import { InAppNotificationData } from './types';

interface NotificationCenterProps {
  notifications: InAppNotificationData[];
  onNotificationUpdate?: (notifications: InAppNotificationData[]) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications: initialNotifications,
  onNotificationUpdate
}) => {
  const [notifications, setNotifications] = useState<InAppNotificationData[]>(initialNotifications || []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const unreadCount = (notifications || []).filter(notification => !notification.read).length;

  const updateNotifications = (updatedNotifications: InAppNotificationData[]) => {
    setNotifications(updatedNotifications);
    onNotificationUpdate?.(updatedNotifications);
  };

  const markNotificationAsRead = (id: string) => {
    const updatedNotifications = (notifications || []).map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    updateNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = (notifications || []).map(notification => (
        { ...notification, read: true }));
    updateNotifications(updatedNotifications);
  }

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openFullHistoryFromSidebar = () => {
    setIsSidebarOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div data-testid="notification-center">
      <NotificationBell 
        unreadCount={unreadCount} 
        onClick={openSidebar} 
      />
      
      <NotificationSidebar
        markAllAsRead={markAllAsRead}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        notifications={notifications}
        onNotificationRead={markNotificationAsRead}
        onOpenFullHistory={openFullHistoryFromSidebar}
        onOpenSettings={() => {}}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title="Центр уведомлений"
        size="full"
      >
        <NotificationsBar
          notifications={notifications}
          onNotificationUpdate={updateNotifications}
        />
      </Modal>
    </div>
  );
};
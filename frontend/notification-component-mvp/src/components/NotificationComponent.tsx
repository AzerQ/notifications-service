import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { NotificationBell } from './NotificationBell';
import { NotificationDropdown } from './NotificationDropdown';
import type { NotificationStore } from '../store/NotificationStore';
import type { Notification } from '../types';

interface NotificationComponentProps {
  store: NotificationStore;
  onNotificationClick?: (notification: Notification) => void;
  bellClassName?: string;
  position?: 'left' | 'right';
}

/**
 * Main notification component combining bell and dropdown
 */
export const NotificationComponent: React.FC<NotificationComponentProps> = observer(({ 
  store,
  onNotificationClick,
  bellClassName,
  position = 'right'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      store.dispose();
    };
  }, [store]);

  return (
    <div 
      ref={containerRef}
      className="relative"
      data-testid="notification-component"
    >
      <NotificationBell 
        store={store} 
        className={bellClassName}
      />
      
      <div className={`absolute ${position === 'right' ? 'right-0' : 'left-0'}`}>
        <NotificationDropdown 
          store={store}
          onNotificationClick={onNotificationClick}
        />
      </div>
    </div>
  );
});

NotificationComponent.displayName = 'NotificationComponent';

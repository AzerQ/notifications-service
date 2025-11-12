import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Settings } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { NotificationDropdown } from './NotificationDropdown';
import { RoutePreferencesModal } from './RoutePreferencesModal';
import { useRoutePreferences } from '../hooks/useRoutePreferences';
import type { NotificationStore } from '../store/NotificationStore';
import type { Notification } from '../types';

interface NotificationComponentProps {
  store: NotificationStore;
  onNotificationClick?: (notification: Notification) => void;
  bellClassName?: string;
  position?: 'left' | 'right';
  showPreferencesButton?: boolean;
}

/**
 * Main notification component combining bell and dropdown
 */
export const NotificationComponent: React.FC<NotificationComponentProps> = observer(({
  store,
  onNotificationClick,
  bellClassName,
  position = 'right',
  showPreferencesButton = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    preferences,
    isLoading: isPreferencesLoading,
    isModalOpen,
    savePreferences,
    closeModal
  } = useRoutePreferences(store);

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
      <div className="flex items-center gap-2">
        <NotificationBell
          store={store}
          className={bellClassName}
        />
        
        {showPreferencesButton && (
          <button
            onClick={store.togglePreferencesModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Настройки уведомлений"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
      
      <div className={`absolute ${position === 'right' ? 'right-0' : 'left-0'}`}>
        <NotificationDropdown
          store={store}
          onNotificationClick={onNotificationClick}
        />
      </div>

      {/* Preferences Modal */}
      <RoutePreferencesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        preferences={preferences}
        onSave={savePreferences}
        isLoading={isPreferencesLoading}
      />
    </div>
  );
});

NotificationComponent.displayName = 'NotificationComponent';

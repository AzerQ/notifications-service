import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Settings } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { NotificationDropdown } from './NotificationDropdown';
import { RoutePreferencesModal } from './RoutePreferencesModal';
import { useRoutePreferences } from '../hooks/useRoutePreferences';
import type { Notification } from '../types';
import { EmailAuthWrapper } from './EmailAuthWrapper';
import { useNotificationContext } from './NotificationContext';
import {config} from "../index.ts";
import styles from './NotificationComponent.module.css';

interface NotificationComponentProps {
  onNotificationClick?: (notification: Notification) => void;
  bellClassName?: string;
  position?: 'left' | 'right';
  showPreferencesButton?: boolean;
}

/**
 * Main notification component combining bell and dropdown
 */
export const NotificationComponent: React.FC<NotificationComponentProps> = observer(({
  onNotificationClick,
  bellClassName,
  position = 'right',
  showPreferencesButton = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { store } = useNotificationContext();

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

  const settingsIconClass = config.iconsTheme === "dark" ? styles.settingsIconDark : styles.settingsIconLight;
  const dropdownPositionClass = position === 'right' ? styles.dropdownRight : styles.dropdownLeft;

  return (
    <div
      ref={containerRef}
      className={styles.container}
      data-testid="notification-component"
    >
      <div className={styles.header}>
        <NotificationBell
          store={store}
          className={bellClassName}
        />
        
        {showPreferencesButton && (
          <button
            onClick={store.togglePreferencesModal}
            className={styles.settingsButton}
            title="Настройки уведомлений"
          >
            <Settings className={`${styles.settingsIcon} ${settingsIconClass}`} />
          </button>
        )}
      </div>
      
      <div className={`${styles.dropdownWrapper} ${dropdownPositionClass}`}>
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
      <EmailAuthWrapper />
    </div>
  );
});

NotificationComponent.displayName = 'NotificationComponent';

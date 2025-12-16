import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { X, Settings, Bell, BellOff } from 'lucide-react';
import type { UserRoutePreference, UserPreferenceDto } from '../types';
import styles from './RoutePreferencesModal.module.css';

interface RoutePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserRoutePreference[];
  onSave: (preferences: UserPreferenceDto[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Modal for managing user notification route preferences
 */
export const RoutePreferencesModal: React.FC<RoutePreferencesModalProps> = observer(({
  isOpen,
  onClose,
  preferences: initialPreferences,
  onSave,
  isLoading = false
}) => {
  const [preferences, setPreferences] = useState<UserRoutePreference[]>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleToggle = (route: string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.route === route 
          ? { ...pref, enabled: !pref.enabled }
          : pref
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Convert to DTO format for API
      const dtos: UserPreferenceDto[] = preferences.map(pref => ({
        route: pref.route,
        enabled: pref.enabled,
        id: pref.id
      }));

      await onSave(dtos);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div 
        className={styles.modal}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Settings className={styles.headerIcon} />
            <h2 className={styles.title}>
              Настройки уведомлений
            </h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={isSaving}
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.preferencesList}>
            {preferences.map((preference) => (
              <div 
                key={preference.route}
                className={styles.preferenceItem}
              >
                <div className={styles.preferenceContent}>
                  <div className={styles.preferenceHeader}>
                    {preference.enabled ? (
                      <Bell className={`${styles.preferenceIcon} ${styles.preferenceIconEnabled}`} />
                    ) : (
                      <BellOff className={`${styles.preferenceIcon} ${styles.preferenceIconDisabled}`} />
                    )}
                    <h3 className={styles.preferenceName}>
                      {preference.routeDisplayName}
                    </h3>
                  </div>
                  <p className={styles.preferenceDescription}>
                    {preference.routeDescription}
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(preference.route)}
                  className={`${styles.toggle} ${preference.enabled ? styles.toggleEnabled : styles.toggleDisabled}`}
                  disabled={isSaving}
                >
                  <span
                    className={`${styles.toggleThumb} ${preference.enabled ? styles.toggleThumbEnabled : ''}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className={styles.saveButton}
          >
            {isSaving && (
              <div className={styles.spinner} />
            )}
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
});

RoutePreferencesModal.displayName = 'RoutePreferencesModal';

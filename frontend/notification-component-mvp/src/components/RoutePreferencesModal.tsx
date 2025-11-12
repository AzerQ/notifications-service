import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { X, Settings, Bell, BellOff } from 'lucide-react';
import type { UserRoutePreference, UserPreferenceDto } from '../types';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Настройки уведомлений
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {preferences.map((preference) => (
              <div 
                key={preference.route}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {preference.enabled ? (
                      <Bell className="w-5 h-5 text-green-600" />
                    ) : (
                      <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                    <h3 className="font-medium text-gray-900">
                      {preference.routeDisplayName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    {preference.routeDescription}
                  </p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(preference.route)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${preference.enabled 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-200 hover:bg-gray-300'
                    }
                  `}
                  disabled={isSaving}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${preference.enabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
});

RoutePreferencesModal.displayName = 'RoutePreferencesModal';
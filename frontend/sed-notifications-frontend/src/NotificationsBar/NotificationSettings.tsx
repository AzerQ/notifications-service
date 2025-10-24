import React, { useState, useEffect } from 'react';
import { X, Settings, Save, Loader2, Mail, Smartphone, Bell, MessageSquare } from 'lucide-react';
import { 
  UserNotificationSettings, 
  NotificationEventSetting, 
  ChannelSetting, 
  NotificationChannel 
} from './types';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  getUserSettings: () => Promise<UserNotificationSettings>;
  saveUserSettings: (settings: UserNotificationSettings) => Promise<void>;
}

const channelIcons: Record<NotificationChannel, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  inApp: Bell
};

const channelLabels: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
  inApp: 'В приложении'
};

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  getUserSettings,
  saveUserSettings
}) => {
  const [settings, setSettings] = useState<UserNotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userSettings = await getUserSettings();
      setSettings(userSettings);
    } catch (err) {
      setError('Ошибка загрузки настроек');
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelToggle = (
    eventId: string, 
    channel: NotificationChannel, 
    group: 'personal' | 'substitute',
    enabled: boolean
  ) => {
    if (!settings) return;

    const updatedSettings = { ...settings };
    const eventSetting = updatedSettings.eventSettings.find(e => e.eventId === eventId);
    
    if (eventSetting) {
      const channelSettings = group === 'personal' 
        ? eventSetting.personalSettings 
        : eventSetting.substituteSettings;
      
      const channelSetting = channelSettings.find(c => c.channel === channel);
      if (channelSetting) {
        channelSetting.enabled = enabled;
      }
    }

    setSettings(updatedSettings);
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setError(null);
    try {
      await saveUserSettings(settings);
      onClose();
    } catch (err) {
      setError('Ошибка сохранения настроек');
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderChannelToggle = (
    eventSetting: NotificationEventSetting,
    channel: NotificationChannel,
    group: 'personal' | 'substitute'
  ) => {
    const channelSettings = group === 'personal' 
      ? eventSetting.personalSettings 
      : eventSetting.substituteSettings;
    
    const channelSetting = channelSettings.find(c => c.channel === channel);
    const isEnabled = channelSetting?.enabled || false;
    const IconComponent = channelIcons[channel];

    return (
      <div key={`${eventSetting.eventId}-${channel}-${group}`} className="flex items-center space-x-2">
        <IconComponent className="w-4 h-4 text-gray-500" />
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleChannelToggle(
              eventSetting.eventId, 
              channel, 
              group, 
              e.target.checked
            )}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{channelLabels[channel]}</span>
        </label>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="notification-settings-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        data-testid="notification-settings-backdrop"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Настройки уведомлений
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Закрыть настройки"
                data-testid="notification-settings-close-button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-500">Загрузка настроек...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-600 mb-2">⚠️</div>
                  <p className="text-red-600 text-center">{error}</p>
                  <button
                    onClick={loadSettings}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Повторить попытку
                  </button>
                </div>
              ) : settings ? (
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 mb-6">
                    Настройте способы получения уведомлений для различных событий в системе.
                    Вы можете отдельно настроить уведомления для себя и при работе по замещению.
                  </div>

                  {settings.eventSettings.map((eventSetting) => (
                    <div key={eventSetting.eventId} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {eventSetting.eventName}
                        </h3>
                        {eventSetting.eventDescription && (
                          <p className="text-sm text-gray-600">
                            {eventSetting.eventDescription}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Настройки для себя */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="text-md font-medium text-gray-800 mb-3">
                            Для себя
                          </h4>
                          <div className="space-y-3">
                            {(['email', 'push', 'inApp', 'sms'] as NotificationChannel[]).map(channel =>
                              renderChannelToggle(eventSetting, channel, 'personal')
                            )}
                          </div>
                        </div>

                        {/* Настройки по замещению */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="text-md font-medium text-gray-800 mb-3">
                            По замещению
                          </h4>
                          <div className="space-y-3">
                            {(['email', 'push', 'inApp', 'sms'] as NotificationChannel[]).map(channel =>
                              renderChannelToggle(eventSetting, channel, 'substitute')
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {settings && !isLoading && !error && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="text-sm text-gray-500">
                  Последнее обновление: {new Date(settings.lastUpdated).toLocaleString('ru-RU')}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    data-testid="notification-settings-save-button"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
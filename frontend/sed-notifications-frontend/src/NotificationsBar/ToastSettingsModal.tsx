import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Bell } from 'lucide-react';
import { ToastSettings, DEFAULT_TOAST_SETTINGS } from './types';
import { SizeSelector, DurationSlider, PositionSelector, ToastPreview } from './ToastSettings';

interface ToastSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  getSettings: () => Promise<ToastSettings>;
  saveSettings: (settings: ToastSettings) => Promise<void>;
}

export const ToastSettingsModal: React.FC<ToastSettingsModalProps> = ({
  isOpen,
  onClose,
  getSettings,
  saveSettings
}) => {
  const [settings, setSettings] = useState<ToastSettings>(DEFAULT_TOAST_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      const loadedSettings = await getSettings();
      setSettings(loadedSettings);
    } catch (err) {
      setError('Ошибка загрузки настроек');
      console.error('Failed to load toast settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await saveSettings(settings);
      setSuccessMessage('Настройки успешно сохранены');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError('Ошибка сохранения настроек');
      console.error('Failed to save toast settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" data-testid="toast-settings-modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
        onClick={onClose}
        data-testid="toast-settings-modal-backdrop"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          data-testid="toast-settings-modal"
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50"
            data-testid="toast-settings-modal-header"
          >
            <div className="flex items-center space-x-3" data-testid="toast-settings-modal-title-wrapper">
              <Bell className="w-6 h-6 text-blue-600" data-testid="toast-settings-modal-icon" />
              <h2 
                className="text-xl font-semibold text-gray-900"
                data-testid="toast-settings-modal-title"
              >
                Настройки всплывающих уведомлений
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Закрыть"
              data-testid="toast-settings-close-button"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-6"
            data-testid="toast-settings-modal-content"
          >
            {isLoading ? (
              <div 
                className="flex items-center justify-center py-12"
                data-testid="toast-settings-loading"
              >
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Загрузка настроек...</span>
              </div>
            ) : error ? (
              <div 
                className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"
                data-testid="toast-settings-error"
              >
                {error}
              </div>
            ) : (
              <div className="space-y-6" data-testid="toast-settings-content">
                <SizeSelector
                  selectedSize={settings.size}
                  onSizeChange={(size) => setSettings({ ...settings, size })}
                />

                <DurationSlider
                  duration={settings.duration}
                  onDurationChange={(duration) => setSettings({ ...settings, duration })}
                />

                <PositionSelector
                  selectedPosition={settings.position}
                  onPositionChange={(position) => setSettings({ ...settings, position })}
                />

                <ToastPreview settings={settings} />

                {successMessage && (
                  <div 
                    className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800"
                    data-testid="toast-settings-success-message"
                  >
                    {successMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isLoading && !error && (
            <div 
              className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50"
              data-testid="toast-settings-modal-footer"
            >
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isSaving}
                data-testid="toast-settings-cancel-button"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                data-testid="toast-settings-save-button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Сохранить</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

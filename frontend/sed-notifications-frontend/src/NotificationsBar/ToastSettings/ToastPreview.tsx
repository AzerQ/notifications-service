import React from 'react';
import { ToastSettings } from '../types';

interface ToastPreviewProps {
  settings: ToastSettings;
}

export const ToastPreview: React.FC<ToastPreviewProps> = ({ settings }) => {
  const getSizeClass = () => {
    switch (settings.size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <div 
      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
      data-testid="toast-preview-container"
    >
      <h3 className="text-sm font-medium text-gray-900 mb-2" data-testid="toast-preview-title">
        Предпросмотр
      </h3>
      <p className="text-xs text-gray-600 mb-3" data-testid="toast-preview-subtitle">
        Так будут выглядеть ваши уведомления с текущими настройками
      </p>
      <div 
        className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm"
        data-testid="toast-preview-sample"
      >
        <div className={getSizeClass()}>
          <div className="font-semibold text-gray-900 mb-1" data-testid="toast-preview-sample-title">
            Пример уведомления
          </div>
          <div className="text-gray-600" data-testid="toast-preview-sample-description">
            Это пример того, как будет выглядеть ваше уведомление
          </div>
          <div className="text-xs text-gray-500 mt-2" data-testid="toast-preview-sample-footer">
            От: Иван Иванов • 5 мин назад
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2" data-testid="toast-preview-info">
        Позиция: {settings.position === 'top' ? 'Сверху' : 'Снизу'}, 
        Длительность: {settings.duration} сек
      </div>
    </div>
  );
};

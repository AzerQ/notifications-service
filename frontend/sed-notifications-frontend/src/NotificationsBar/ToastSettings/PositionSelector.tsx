import React from 'react';
import { ToastPosition } from '../types';

interface PositionSelectorProps {
  selectedPosition: ToastPosition;
  onPositionChange: (position: ToastPosition) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  selectedPosition,
  onPositionChange
}) => {
  const positions: { value: ToastPosition; label: string; description: string }[] = [
    { value: 'top', label: 'Сверху', description: 'Верхний правый угол' },
    { value: 'bottom', label: 'Снизу', description: 'Нижний правый угол' }
  ];

  return (
    <div data-testid="toast-position-selector">
      <label className="block text-sm font-medium text-gray-900 mb-3">
        Направление отображения
      </label>
      <div className="grid grid-cols-2 gap-4">
        {positions.map(({ value, label, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => onPositionChange(value)}
            className={`
              p-4 border-2 rounded-lg text-center transition-all
              ${selectedPosition === value
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
            data-testid={`toast-position-${value}`}
            aria-pressed={selectedPosition === value}
            aria-label={`Выбрать позицию ${label}`}
          >
            <div className="font-medium">
              {label}
            </div>
            <div className="text-xs mt-1 opacity-75">
              {description}
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-500" data-testid="toast-position-description">
        Позиция, где будут появляться новые уведомления
      </p>
    </div>
  );
};

import React from 'react';
import { ToastSize } from '../types';

interface SizeSelectorProps {
  selectedSize: ToastSize;
  onSizeChange: (size: ToastSize) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  selectedSize,
  onSizeChange
}) => {
  const sizes: { value: ToastSize; label: string; width: string }[] = [
    { value: 'small', label: 'Маленький', width: '320px' },
    { value: 'medium', label: 'Средний', width: '384px' },
    { value: 'large', label: 'Большой', width: '448px' }
  ];

  return (
    <div data-testid="toast-size-selector">
      <label className="block text-sm font-medium text-gray-900 mb-3">
        Размер уведомления
      </label>
      <div className="grid grid-cols-3 gap-4">
        {sizes.map(({ value, label, width }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSizeChange(value)}
            className={`
              p-4 border-2 rounded-lg text-center transition-all
              ${selectedSize === value
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
            data-testid={`toast-size-${value}`}
            aria-pressed={selectedSize === value}
            aria-label={`Выбрать размер ${label}`}
          >
            <div className="font-medium">
              {label}
            </div>
            <div className="text-xs mt-1 opacity-75">
              {width}
            </div>
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-500" data-testid="toast-size-description">
        Размер всплывающего уведомления и шрифта изменяется пропорционально
      </p>
    </div>
  );
};

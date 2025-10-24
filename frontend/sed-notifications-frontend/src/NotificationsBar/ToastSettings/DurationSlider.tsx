import React from 'react';

interface DurationSliderProps {
  duration: number;
  onDurationChange: (duration: number) => void;
}

export const DurationSlider: React.FC<DurationSliderProps> = ({
  duration,
  onDurationChange
}) => {
  return (
    <div data-testid="toast-duration-selector">
      <label htmlFor="duration" className="block text-sm font-medium text-gray-900 mb-3">
        Время показа уведомления: <span data-testid="toast-duration-value">{duration} сек</span>
      </label>
      <input
        id="duration"
        type="range"
        min="1"
        max="10"
        step="1"
        value={duration}
        onChange={(e) => onDurationChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        data-testid="toast-duration-slider"
        aria-label="Время показа уведомления"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={duration}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1" data-testid="toast-duration-labels">
        <span>1 сек</span>
        <span>5 сек</span>
        <span>10 сек</span>
      </div>
      <p className="mt-2 text-sm text-gray-500" data-testid="toast-duration-description">
        Время отображения всплывающего уведомления перед автоматическим закрытием
      </p>
    </div>
  );
};

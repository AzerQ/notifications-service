import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Notification } from '../types';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

/**
 * Toast notification component for showing new SignalR notifications
 * Auto-closes after specified duration with smooth animations
 */
export const Toast: React.FC<ToastProps> = ({ notification, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after mount
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleClick = () => {
    if (notification.url) {
      window.open(notification.url, '_blank');
      handleClose();
    }
  };

  return (
    <div
      className={`
     w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isClosing ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${notification.url ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : ''}
      "`}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
      data-testid="toast-notification"
      data-notification-id={notification.id}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            {/* Type Badge */}
            {notification.type && (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
                {notification.type}
              </span>
            )}

            {/* Subtype if exists */}
            {notification.subType && (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-2 ml-2">
                {notification.subType}
              </span>
            )}

            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
              {notification.title}
            </h3>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close notification"
            data-testid="toast-close-button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {notification.content && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">
            {notification.content}
          </p>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {/* Author if exists */}
          {notification.author && (
            <span className="flex items-center">
              <span className="font-medium">{notification.author}</span>
            </span>
          )}

          {/* URL indicator */}
          {notification.url && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Click to view ?
            </span>
          )}
        </div>

        {/* Hashtags if exist */}
        {notification.hashtags && notification.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {notification.hashtags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-b-lg">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 transition-all ease-linear"
          style={{
            width: '100%',
            animation: `shrink ${duration}ms linear`
          }}
        />
      </div>
    </div>
  );
};

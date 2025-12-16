import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Notification } from '../types';
import styles from './Toast.module.css';

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
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after mount
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Start timer animation slightly after mount
    const timerStart = setTimeout(() => {
      setIsTimerRunning(true);
    }, 50);

    // Auto-close after duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(timerStart);
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

  const toastClasses = [
    styles.toast,
    isVisible && !isClosing ? styles.visible : '',
    notification.url ? styles.clickable : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={toastClasses}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
      data-testid="toast-notification"
      data-notification-id={notification.id}
    >
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {/* Type Badge */}
            {notification.type && (
              <span className={styles.badge}>
                {notification.type}
              </span>
            )}

            {/* Subtype if exists */}
            {notification.subType && (
              <span className={styles.subTypeBadge}>
                {notification.subType}
              </span>
            )}

            {/* Title */}
            <h3 className={styles.title}>
              {notification.title}
            </h3>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className={styles.closeButton}
            aria-label="Закрыть уведомление"
            data-testid="toast-close-button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {notification.content && (
          <p className={styles.text}>
            {notification.content}
          </p>
        )}

        {/* Footer with metadata */}
        <div className={styles.footer}>
          {/* Author if exists */}
          {notification.author && (
            <span className={styles.author}>
              <span className={styles.authorName}>{notification.author}</span>
            </span>
          )}

          {/* URL indicator */}
          {notification.url && (
            <span className={styles.urlIndicator}>
              Нажмите для просмотра
            </span>
          )}
        </div>

        {/* Hashtags if exist */}
        {notification.hashtags && notification.hashtags.length > 0 && (
          <div className={styles.hashtags}>
            {notification.hashtags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={styles.hashtag}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={`${styles.progress} ${isTimerRunning ? styles.shrinking : ''}`}
          style={
            {
              '--toast-duration': `${duration}ms`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
};

import React from 'react';
import { observer } from 'mobx-react-lite';
import {Bell, ExternalLink, Check, X, LucideProps} from 'lucide-react';
import type { Notification } from '../types';
import * as LucideIcons from 'lucide-react';
import styles from './NotificationItem.module.css';

interface CustomIconProps extends LucideProps {
  name: string;
}

function toPascalCase(text: string) {
  function clearAndUpper(text: string) {
    return text.replace(/-/, "").toUpperCase();
  }
  return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

const DynamicIcon = ({name, ...props} : CustomIconProps) => {
  const iconName = toPascalCase(name);
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <IconComponent {...props}/>
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

/**
 * Single notification item component
 */
export const NotificationItem: React.FC<NotificationItemProps> = observer(({ 
  notification, 
  onMarkAsRead,
  onMarkAsUnread,
  onClick 
}) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
    
    // Navigate to URL if provided
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read) {
      onMarkAsUnread(notification.id);
    } else {
      onMarkAsRead(notification.id);
    }
  };

  const getIcon = () => {
    if (notification.icon) {
      // Use backend-provided icon with custom class if available
      return (
        <div className={`${styles.icon} ${notification.icon.cssClass || ''}`}>
              <DynamicIcon name={notification.icon.name} className={styles.iconInner}/>
        </div>
      );
    }
    
    // Default bell icon
    return (
      <div className={styles.icon}>
        <Bell className={styles.iconInner} />
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins}м назад`;
    if (diffHours < 24) return `${diffHours}ч назад`;
    if (diffDays < 7) return `${diffDays}д назад`;
    
    return date.toLocaleDateString();
  };

  // Support both new (date, type) and legacy (createdAt, category) field names
  const displayDate = notification.date || notification.createdAt || new Date().toISOString();
  const displayType = notification.type || notification.category;
  const displaySubType = notification.subType;

  const itemClasses = `${styles.item} ${!notification.read ? styles.unread : ''}`;

  return (
    <div
      onClick={handleClick}
      className={itemClasses}
      data-testid="notification-item"
      data-read={notification.read}
    >
      <div className={styles.container}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.contentTop}>
            <div className={styles.contentLeft}>
              {/* Type and Subtype badges */}
              <div className={styles.badges}>
                {displayType && (
                  <span className={styles.badge}>
                    {displayType}
                  </span>
                )}
                {displaySubType && (
                  <span className={styles.subTypeBadge}>
                    {displaySubType}
                  </span>
                )}
              </div>
   
              <h4 className={styles.title}>
                {notification.title}
              </h4>
            </div>
            
            {/* Read/Unread toggle */}
            <button
              onClick={handleToggleRead}
              className={styles.toggleButton}
              aria-label={notification.read ? 'Отметить как непрочитанное' : 'Отметить как прочитанное'}
              data-testid="notification-toggle-read"
            >
              {notification.read ? (
                <X className={`${styles.toggleIcon} ${styles.toggleIconRead}`} />
              ) : (
                <Check className={`${styles.toggleIcon} ${styles.toggleIconUnread}`} />
              )}
            </button>
          </div>

          <p className={styles.text}>
            {notification.content}
          </p>

          <div className={styles.metadata}>
            <span className={styles.metadataItem}>
              {formatDate(displayDate)}
            </span>
            
            {notification.author && (
              <>
                <span className={styles.metadataSeparator}>•</span>
                <span className={styles.metadataItem}>
                  {notification.author}
                </span>
              </>
            )}
        
            {notification.url && (
              <>
                <span className={styles.metadataSeparator}>•</span>
                <ExternalLink className={styles.externalIcon} />
              </>
            )}
          </div>

          {/* Hashtags */}
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
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

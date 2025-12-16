import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { CheckCheck, Eye, EyeClosed, Loader2 } from "lucide-react";
import type { NotificationStore } from "../store/NotificationStore";
import { NotificationItem } from "./NotificationItem";
import { ToastContainer } from "./ToastContainer";
import { num_decline } from "../utils/numDecline";
import styles from './NotificationDropdown.module.css';

interface NotificationDropdownProps {
  store: NotificationStore;
  onNotificationClick?: (notification: any) => void;
  maxHeight?: string;
}

/**
 * Notification dropdown/list component with toast support
 */
export const NotificationDropdown: React.FC<NotificationDropdownProps> =
  observer(({ store, onNotificationClick, maxHeight = "400px" }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Setup toast callback on mount
    useEffect(() => {
      const showToast = (notification: any) => {
        if ((window as any).__showNotificationToast) {
          (window as any).__showNotificationToast(notification);
        }
      };

      store.setShowToastCallback(showToast);
      console.log("[NotificationDropdown] Toast callback registered");

      return () => {
        store.setShowToastCallback(undefined);
      };
    }, [store]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          store.closeDropdown();
        }
      };

      if (store.isDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [store, store.isDropdownOpen]);

    if (!store.isDropdownOpen) {
      return (
        <>
          <ToastContainer />
        </>
      );
    }

    const handleFilterUnread = () => {
      if (store.filters.onlyUnread) {
        store.clearFilters();
      } else {
        store.setFilters({ onlyUnread: true });
      }
    };

    const unreadNotificationsLabel =
      num_decline(store.unreadCount, ["непрочитанное", "непрочитанных"]) +
      " " +
      num_decline(store.unreadCount, ["уведомление", "уведомлений"], false);

    const displayedNotifications =
      (store.filters.onlyUnread
        ? store.unreadNotifications
        : store.notifications) ?? []; // Show max 20 in dropdown

    return (
      <>
        <ToastContainer />
        <div
          ref={dropdownRef}
          className={styles.dropdown}
          data-testid="notification-dropdown"
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <h3 className={styles.title}>
                Уведомления
              </h3>

              <div className={styles.actions}>
                {/* Filter button */}
                <button
                  onClick={handleFilterUnread}
                  className={`${styles.actionButton} ${store.filters.onlyUnread ? styles.active : ''}`}
                  aria-label="Фильтр непрочитанных"
                  data-testid="notification-filter-unread"
                  title={
                    store.filters.onlyUnread
                      ? "Показать все"
                      : "Показать только непрочитанные"
                  }
                >
                {store.filters.onlyUnread ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-6 h-6" /> }  
                </button>

                {/* Mark all as read */}
                {store.hasUnread && (
                  <button
                    onClick={() => store.markAllAsRead()}
                    className={styles.actionButton}
                    aria-label="Отметить все как прочитанные"
                    data-testid="notification-mark-all-read"
                    title="Отметить все как прочитанные"
                  >
                    <CheckCheck className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {store.unreadCount > 0 && (
              <p className={styles.subtitle}>
                У вас {unreadNotificationsLabel}
              </p>
            )}
          </div>

          {/* Content */}
          <div
            className={styles.content}
            style={{ maxHeight }}
            data-testid="notification-list"
          >
            {store.isLoading ? (
              <div className={styles.loading}>
                <Loader2 className={styles.spinner} />
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>
                  {store.filters.onlyUnread
                    ? "Нет непрочитанных уведомлений"
                    : "Уведомлений пока нет"}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => store.markAsRead(id)}
                  onMarkAsUnread={(id) => store.markAsUnread(id)}
                  onClick={onNotificationClick}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {!store.isLoading && displayedNotifications.length > 0 && (
            <div className={styles.footer}>
              <button
                onClick={() => {
                  store.closeDropdown();
                  // Could navigate to full notifications page here
                }}
                className={styles.viewAllButton}
                data-testid="notification-view-all"
              >
                Показать все уведомления
              </button>
            </div>
          )}

          {/* SignalR connection status */}
          {!store.isSignalRConnected && (
            <div className={styles.connectionStatus}>
              <p className={styles.connectionStatusText}>
                Соединение для обновлений в реальном времени разорвано
              </p>
            </div>
          )}
        </div>
      </>
    );
  });

NotificationDropdown.displayName = "NotificationDropdown";

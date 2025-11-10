import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { CheckCheck, Filter, Loader2 } from 'lucide-react';
import type { NotificationStore } from '../store/NotificationStore';
import { NotificationItem } from './NotificationItem';
import { ToastContainer } from './ToastContainer';

interface NotificationDropdownProps {
  store: NotificationStore;
  onNotificationClick?: (notification: any) => void;
  maxHeight?: string;
}

/**
 * Notification dropdown/list component with toast support
 */
export const NotificationDropdown: React.FC<NotificationDropdownProps> = observer(({ 
  store,
  onNotificationClick,
  maxHeight = '400px'
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Setup toast callback on mount
  useEffect(() => {
    const showToast = (notification: any) => {
      if ((window as any).__showNotificationToast) {
(window as any).__showNotificationToast(notification);
      }
    };
    
    store.setShowToastCallback(showToast);
    console.log('[NotificationDropdown] Toast callback registered');
    
  return () => {
      store.setShowToastCallback(undefined);
    };
  }, [store]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        store.closeDropdown();
      }
    };

    if (store.isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const displayedNotifications = (store.filters.onlyUnread ? store.unreadNotifications : store.notifications) ?? []; // Show max 20 in dropdown

  return (
    <>
      <ToastContainer />
      <div
 ref={dropdownRef}
        className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
  data-testid="notification-dropdown"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
          Notifications
     </h3>
         
 <div className="flex items-center gap-2">
         {/* Filter button */}
          <button
        onClick={handleFilterUnread}
        className={`p-2 rounded hover:bg-gray-100 transition-colors ${
         store.filters.onlyUnread ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
           }`}
                aria-label="Filter unread"
      data-testid="notification-filter-unread"
          title={store.filters.onlyUnread ? 'Show all' : 'Show unread only'}
              >
    <Filter className="w-4 h-4" />
     </button>

  {/* Mark all as read */}
              {store.hasUnread && (
<button
           onClick={() => store.markAllAsRead()}
    className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Mark all as read"
      data-testid="notification-mark-all-read"
   title="Mark all as read"
 >
<CheckCheck className="w-4 h-4" />
                </button>
              )}
 </div>
     </div>

          {store.unreadCount > 0 && (
          <p className="text-sm text-gray-500 mt-1">
              {store.unreadCount} unread notification{store.unreadCount !== 1 ? 's' : ''}
    </p>
          )}
        </div>

        {/* Content */}
        <div 
          className="overflow-y-auto"
    style={{ maxHeight }}
          data-testid="notification-list"
        >
          {store.isLoading ? (
            <div className="flex items-center justify-center py-8">
     <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="text-center py-8 px-4">
           <p className="text-gray-500">
      {store.filters.onlyUnread 
      ? 'No unread notifications' 
      : 'No notifications yet'}
              </p>
 </div>
          ) : (
            displayedNotifications.map(notification => (
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
<div className="p-3 border-t border-gray-200 text-center">
            <button
     onClick={() => {
        store.closeDropdown();
            // Could navigate to full notifications page here
      }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
         data-testid="notification-view-all"
     >
  View all notifications
       </button>
        </div>
        )}

        {/* SignalR connection status */}
        {!store.isSignalRConnected && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
         <p className="text-xs text-yellow-700">
       Real-time updates disconnected
            </p>
      </div>
      )}
   </div>
    </>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';

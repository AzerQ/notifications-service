import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/RootStore';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';

const NotificationPanel: React.FC = observer(() => {
  const { notificationStore } = useStores();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600">
              {notificationStore.unreadCount} unread
            </p>
          </div>
        </div>
      </div>

      {notificationStore.loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading notifications...
        </div>
      ) : notificationStore.notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {notificationStore.notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                notification.read
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => notificationStore.markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {notification.read ? (
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                    ) : (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(notification.createdAt)}</span>
                    <span className="px-2 py-0.5 bg-gray-200 rounded-full">
                      {notification.route}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default NotificationPanel;

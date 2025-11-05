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
                    {notification.message || notification.content}
                  </p>
                  {notification.author && (
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">From:</span> {notification.author}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(notification.createdAt || notification.date)}</span>
                    {(notification.route || notification.type) && (
                      <span className="px-2 py-0.5 bg-gray-200 rounded-full">
                        {notification.route || notification.type}
                      </span>
                    )}
                  </div>
                  {notification.hashtags && notification.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {notification.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {notification.actions.map((action, idx) => (
                        <a
                          key={idx}
                          href={action.url}
                          className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {action.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {notification.parameters && notification.parameters.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      {notification.parameters.map((param, idx) => (
                        <div key={idx} className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">{param.key}:</span> {param.value}
                          {param.description && <span className="text-gray-400"> ({param.description})</span>}
                        </div>
                      ))}
                    </div>
                  )}
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

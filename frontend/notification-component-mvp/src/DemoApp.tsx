import React from 'react';
import { NotificationComponent } from './components/NotificationComponent';
import { useNotificationStore } from './hooks/useNotificationStore';

/**
 * Demo application showcasing the notification component
 */
export const DemoApp: React.FC = () => {
  // Mock configuration - in real app, these would come from your auth system
  const config = {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5093',
    signalRHubUrl: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5093/notificationHub',
    userId: import.meta.env.VITE_USER_ID || 'test-user-id',
    accessToken: import.meta.env.VITE_ACCESS_TOKEN,
  };

  const store = useNotificationStore(config);

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Notification Component MVP Demo
              </h1>
            </div>
            
            {/* Notification component in header */}
            <div className="flex items-center space-x-4">
              <NotificationComponent 
                store={store}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to the Notification Component MVP
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Clean, simple notification bell with unread count badge</li>
                <li>• Dropdown list showing recent notifications</li>
                <li>• Mark individual notifications as read/unread</li>
                <li>• Mark all notifications as read</li>
                <li>• Filter to show only unread notifications</li>
                <li>• Real-time updates via SignalR</li>
                <li>• Backend icon support with fallback</li>
                <li>• Time-ago formatting for notification dates</li>
                <li>• Click to open notification URLs</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Component Status:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Notifications:</span>
                  <div className="font-semibold text-gray-900">{store.notifications.length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Unread Count:</span>
                  <div className="font-semibold text-gray-900">{store.unreadCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">SignalR Status:</span>
                  <div className={`font-semibold ${store.isSignalRConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {store.isSignalRConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Loading:</span>
                  <div className="font-semibold text-gray-900">{store.isLoading ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Configuration:</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>API URL:</strong> {config.apiBaseUrl}</p>
                <p><strong>SignalR Hub:</strong> {config.signalRHubUrl}</p>
                <p><strong>User ID:</strong> {config.userId}</p>
                <p><strong>Token:</strong> {config.accessToken ? '***' : 'Not set'}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">How to Use:</h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Click the bell icon in the top right to open notifications</li>
                <li>Click on a notification to mark it as read and open its link</li>
                <li>Use the filter button to toggle between all/unread notifications</li>
                <li>Use the checkmark button to mark all as read</li>
                <li>Notifications will appear in real-time when sent via SignalR</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

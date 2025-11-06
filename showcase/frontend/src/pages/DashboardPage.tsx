import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../stores/RootStore';
import { Bell, LogOut, Send, User, BellRing } from 'lucide-react';
import NotificationPanel from '../components/NotificationPanel';
import SendNotificationForm from '../components/SendNotificationForm';

const DashboardPage: React.FC = observer(() => {
  const { authStore, notificationStore } = useStores();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!authStore.isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load notifications and initialize SignalR
    if (authStore.user && authStore.accessToken) {
      notificationStore.loadNotifications(authStore.user.id);
      notificationStore.initializeSignalR(authStore.user.id, authStore.accessToken);
    }

    return () => {
      notificationStore.disconnect();
    };
  }, [authStore.isAuthenticated, authStore.user, authStore.accessToken]);

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  if (!authStore.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BellRing className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notification Service</h1>
                <p className="text-sm text-gray-600">Showcase Application</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                {notificationStore.unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationStore.unreadCount}
                  </span>
                )}
              </button>

              {/* User Info */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{authStore.user.name}</p>
                  <p className="text-xs text-gray-600">{authStore.user.email}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Send Notification */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Send Test Notification</h2>
                  <p className="text-sm text-gray-600">Test the notification system with different templates</p>
                </div>
              </div>
              <SendNotificationForm />
            </div>
          </div>

          {/* Right Column - Notifications */}
          <div className="lg:col-span-1">
            <NotificationPanel />
          </div>
        </div>
      </main>

      {/* Notification Dropdown (Mobile/Tablet) */}
      {showNotifications && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowNotifications(false)}>
          <div className="absolute right-0 top-16 bg-white shadow-xl rounded-lg m-4 w-96 max-w-[calc(100vw-2rem)]" onClick={(e) => e.stopPropagation()}>
            <NotificationPanel />
          </div>
        </div>
      )}
    </div>
  );
});

export default DashboardPage;

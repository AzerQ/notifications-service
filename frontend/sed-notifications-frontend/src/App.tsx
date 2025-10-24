import React, { useState, useEffect } from "react";
import { observer } from 'mobx-react-lite';
import { Plus, Wifi } from 'lucide-react';
import { NotificationCenter, NotificationCenterWithStore } from "./NotificationsBar";
import { mockNotifications } from "./MockNotifications";
import { InAppNotificationData } from "./NotificationsBar/types";
import { ToastProvider } from "./NotificationsBar/Toast/ToastProvider";
import { CompactToastProvider } from "./NotificationsBar/Toast/CompactToastProvider";
import { NotificationStoreProvider, signalRService, useNotificationStore } from "./store/NotificationStoreContext";

const AppContent: React.FC = observer(() => {
    const [notifications, setNotifications] = useState<InAppNotificationData[]>(mockNotifications);
    const [useNewStore, setUseNewStore] = useState(true);
    const store = useNotificationStore();

    const handleNotificationUpdate = (updatedNotifications: InAppNotificationData[]) => {
        setNotifications(updatedNotifications);
    };

    const testSignalRNotification = () => {
        // Принудительно эмулируем SignalR уведомление
        if (signalRService && 'simulateNewNotification' in signalRService) {
            (signalRService as any).simulateNewNotification({
                title: 'Тестовое SignalR уведомление',
                type: 'system',
                subtype: 'test',
                author: 'Тестовая система'
            });
        }
    };

    return (
        <CompactToastProvider 
            settings={store.toastSettings} 
            shouldShowToasts={store.shouldShowToasts}
        >
            {({ showCompactToast }) => {
                // Устанавливаем колбек для показа всплывающих уведомлений
                useEffect(() => {
                    store.setShowCompactToastCallback(showCompactToast);
                }, [showCompactToast, store]);

                return (
                    <ToastProvider>
                        {({ showToast, testToasts, togglePosition, position }) => (
                    <div className="min-h-screen bg-gray-100" data-testid="app-root">
                        <header className="bg-white shadow-sm border-b border-gray-200" data-testid="app-header">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center h-16">
                                    <div className="flex items-center" data-testid="app-header-logo">
                                        <h1 className="text-xl font-semibold text-gray-900">
                                            Система документооборота
                                        </h1>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4" data-testid="app-header-actions">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={useNewStore}
                                                onChange={(e) => setUseNewStore(e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-gray-700">
                                                MobX + SignalR
                                            </span>
                                        </label>

                                                                                <button
                                            onClick={testSignalRNotification}
                                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                            data-testid="app-test-signalr-button"
                                        >
                                            <Wifi className="w-4 h-4" />
                                            <span>Тест SignalR</span>
                                        </button>

                                        
                                        <button
                                            onClick={testToasts}
                                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                            data-testid="app-test-toasts-button"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Тест alerts</span>
                                        </button>
                                        <button
                                            onClick={togglePosition}
                                            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                            data-testid="app-toggle-position-button"
                                        >
                                            Позиция: {position === 'top' ? 'Сверху' : 'Снизу'}
                                        </button>
                                        
                                        {useNewStore ? (
                                            <NotificationCenterWithStore />
                                        ) : (
                                            <NotificationCenter 
                                                notifications={notifications} 
                                                onNotificationUpdate={handleNotificationUpdate}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="app-main-content">
                            <div className="bg-white rounded-lg shadow p-6" data-testid="app-welcome-section">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Добро пожаловать в систему!
                                </h2>
                                <div className="space-y-4">
                                    <p className="text-gray-600">
                                        Нажмите на иконку колокольчика в правом верхнем углу, чтобы открыть 
                                        боковое меню с новыми уведомлениями.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="app-features-info">
                                        <h3 className="font-semibold text-blue-900 mb-2">Функции системы уведомлений:</h3>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Компактное боковое меню с непрочитанными уведомлениями</li>
                                            <li>• Клик по уведомлению для перехода по ссылке и пометки как прочитанное</li>
                                            <li>• Кнопка "Вся история уведомлений" для открытия полного модального окна</li>
                                            <li>• Автообновление счетчика после прочтения уведомлений</li>
                                            <li>• Полная история с фильтрами, сортировкой и поиском</li>
                                            <li>• Всплывающие уведомления при получении новых через SignalR</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4" data-testid="app-stats-section">
                                        <h4 className="font-medium text-gray-900 mb-2">Статистика уведомлений:</h4>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div data-testid="app-stats-total">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {notifications.length}
                                                </div>
                                                <div className="text-sm text-gray-600">Всего</div>
                                            </div>
                                            <div data-testid="app-stats-unread">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {notifications.filter(n => !n.read).length}
                                                </div>
                                                <div className="text-sm text-gray-600">Непрочитанных</div>
                                            </div>
                                            <div data-testid="app-stats-starred">
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {notifications.filter(n => n.starred).length}
                                                </div>
                                                <div className="text-sm text-gray-600">Избранных</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                        )}
                    </ToastProvider>
                );
            }}
        </CompactToastProvider>
    );
});

const App: React.FC = () => {
    return (
        <NotificationStoreProvider>
            <AppContent />
        </NotificationStoreProvider>
    );
};

export default App;

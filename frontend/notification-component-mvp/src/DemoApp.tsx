import React, { useState, useEffect } from 'react';
import { NotificationComponent } from './components/NotificationComponent';
import { EmailCodeModal } from './components/EmailCodeModal';
import { useNotificationStore } from './hooks/useNotificationStore';
import { useRoutePreferences } from './hooks/useRoutePreferences';

export const DemoApp: React.FC = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

  const config = {
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5093',
    signalRHubUrl: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5093/notificationHub',
    accessToken: import.meta.env.VITE_ACCESS_TOKEN,
    onEmailCodeRequired: (email: string) => {
      console.log('[DemoApp] Email code required for:', email);
      setCurrentEmail(email);
      setShowEmailModal(true);
    },
  };

  const { store, authentication } = useNotificationStore(config);
  const preferences = useRoutePreferences(store);

  useEffect(() => {
    if (authentication.authState.requiresEmailCode || authentication.authState.requiresEmailInput) {
      setShowEmailModal(true);
    }
  }, [authentication.authState.requiresEmailCode, authentication.authState.requiresEmailInput]);

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  const handleVerifyEmailCode = async (verification: { id: string; code: string }) => {
    try {
      console.log('[DemoApp] Verifying email code...');
      await authentication.verifyEmailCode(verification);
      console.log('[DemoApp] Verification successful!');
      setShowEmailModal(false);
    } catch (error) {
      console.error('[DemoApp] Email verification failed:', error);
    }
  };

  const handleResendCode = async (email: string) => {
    try {
      setCurrentEmail(email);
      await authentication.sendEmailCode(email);
      console.log('[DemoApp] Code resent successfully');
    } catch (error) {
      console.error('[DemoApp] Failed to resend code:', error);
    }
  };

  const handleCloseModal = () => {
    setShowEmailModal(false);
    authentication.clearError();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              MVP компонента уведомлений
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  authentication.authState.isAuthenticated ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {authentication.authState.isAuthenticated ? 'Аутентифицирован' : 'Не аутентифицирован'}
              </div>
              <NotificationComponent
                store={store}
                onNotificationClick={handleNotificationClick}
                showPreferencesButton={true}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
         <h2 className="text-2xl font-bold">Демонстрация автоматической аутентификации</h2>
         
         <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
           <h3 className="font-semibold text-purple-900 mb-2">🔐 Стратегия аутентификации:</h3>
           <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
             <li><strong>Уровень 1:</strong> Попытка использовать токен обновления из localStorage</li>
             <li><strong>Уровень 2:</strong> Попытка аутентификации Windows (автоматически)</li>
             <li><strong>Уровень 3:</strong> Запрос электронной почты и отправка кода проверки</li>
           </ol>
           <p className="text-xs text-purple-600 mt-2">
             ✓ Если аутентификация Windows не удалась, модальное окно электронной почты открывается автоматически!
           </p>
           <p className="text-xs text-purple-600 mt-1">
             🔑 Информация пользователя извлекается из токена JWT - не требуются жестко закодированные ID!
           </p>
         </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium mb-2">Статус:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Уведомления:</span>
                <div className="font-semibold">{store.notifications?.length ?? 0}</div>
              </div>
              <div>
                <span className="text-gray-600">Непрочитанные:</span>
                <div className="font-semibold">{store.unreadCount}</div>
              </div>
              <div>
                <span className="text-gray-600">SignalR:</span>
                <div className={`font-semibold ${store.isSignalRConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {store.isSignalRConnected ? 'Подключено' : 'Отключено'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Аутентификация:</span>
                <div className={`font-semibold ${
                  authentication.authState.isAuthenticated ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {authentication.authState.isAuthenticated ? 'Аутентифицирован' :
                   authentication.authState.isAuthenticating ? 'Аутентификация...' : 'Не аутентифицирован'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Требуется электронная почта:</span>
                <div className="font-semibold">
                  {authentication.authState.requiresEmailInput ? 'Да (введите почту)' :
                   authentication.authState.requiresEmailCode ? 'Да (введите код)' : 'Нет'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Модальное окно:</span>
                <div className="font-semibold">
                  {showEmailModal ? 'Открыто' : 'Закрыто'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Настройки:</span>
                <div className="font-semibold">
                  {preferences.isModalOpen ? 'Открыты' : 'Закрыты'}
                </div>
              </div>
            </div>
            
            {authentication.authState.error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-800">{authentication.authState.error}</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-medium text-indigo-900 mb-2">Тестовые действия:</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => authentication.authenticate()}
                disabled={authentication.authState.isAuthenticating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {authentication.authState.isAuthenticating ? 'Аутентификация...' : 'Переаутентифицировать'}
              </button>
              <button
                onClick={() => authentication.logout()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Выход
              </button>
              <button
                onClick={() => {
                  authentication.setRequiresEmailInput(true);
                  setShowEmailModal(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Тест модального окна (с вводом почты)
              </button>
              <button
                onClick={async () => {
                  try {
                    await authentication.sendEmailCode('test@example.com');
                    setCurrentEmail('test@example.com');
                    setShowEmailModal(true);
                  } catch (error) {
                    console.error('Ошибка отправки кода:', error);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Тест модального окна (только код)
              </button>
              <button
                onClick={() => preferences.openModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Открыть настройки уведомлений
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">⚙️ Настройки уведомлений:</h4>
            <div className="text-sm text-green-800 space-y-2">
              <p>✨ <strong>Новая функция:</strong> Настройки маршрутов уведомлений</p>
              <p>📝 Нажмите на кнопку настроек (шестеренка) рядом с колокольчиком</p>
              <p>🔄 Включайте/выключайте уведомления для разных типов событий</p>
              <p>💾 Изменения автоматически сохраняются на бэкенде</p>
              <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                <strong>API endpoints:</strong><br/>
                • GET /api/user-route-preferences<br/>
                • PUT /api/user-route-preferences
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">❓ Как это работает:</h4>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>При загрузке автоматически пытается использовать уровень 1 (токен обновления)</li>
              <li>Если не удалось, пытается уровень 2 (аутентификация Windows)</li>
              <li>Если аутентификация Windows не удалась, <strong>модальное окно электронной почты открывается автоматически</strong></li>
              <li>Пользователь вводит почту → отправляется код → пользователь вводит код → аутентифицирован!</li>
              <li>При ошибке 401 во время работы тот же процесс повторяется автоматически</li>
              <li><strong>Бэкенд извлекает информацию пользователя из токена JWT</strong> - не требуются жестко закодированные ID!</li>
            </ol>
          </div>
        </div>
      </main>

      <EmailCodeModal
        isOpen={showEmailModal}
        challengeId={authentication.authState.emailChallengeId || ''}
        challengeMessage={authentication.authState.emailChallengeMessage || undefined}
        email={currentEmail}
        error={authentication.authState.error}
        onVerify={handleVerifyEmailCode}
        onResendCode={handleResendCode}
        onClose={handleCloseModal}
        requiresEmailInput={authentication.authState.requiresEmailInput}
      />
    </div>
  );
};

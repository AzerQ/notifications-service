import React, { useState, useEffect } from 'react';
import { NotificationComponent } from './components/NotificationComponent';
import { EmailCodeModal } from './components/EmailCodeModal';
import { useNotificationStore } from './hooks/useNotificationStore';

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
              Notification Component MVP
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  authentication.authState.isAuthenticated ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {authentication.authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </div>
              <NotificationComponent 
                store={store}
                onNotificationClick={handleNotificationClick}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-2xl font-bold">Auto-Authentication Demo</h2>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">?? Authentication Strategy:</h3>
            <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
              <li><strong>Level 1:</strong> Try refresh token from localStorage</li>
              <li><strong>Level 2:</strong> Try Windows authentication (automatic)</li>
              <li><strong>Level 3:</strong> Request email and send verification code</li>
            </ol>
            <p className="text-xs text-purple-600 mt-2">
              ? If Windows auth fails, email modal opens automatically!
            </p>
            <p className="text-xs text-purple-600 mt-1">
              ?? User info is extracted from JWT token - no hardcoded IDs!
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium mb-2">Status:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Notifications:</span>
                <div className="font-semibold">{store.notifications?.length ?? 0}</div>
              </div>
              <div>
                <span className="text-gray-600">Unread:</span>
                <div className="font-semibold">{store.unreadCount}</div>
              </div>
              <div>
                <span className="text-gray-600">SignalR:</span>
                <div className={`font-semibold ${store.isSignalRConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {store.isSignalRConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Auth:</span>
                <div className={`font-semibold ${
                  authentication.authState.isAuthenticated ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {authentication.authState.isAuthenticated ? 'Authenticated' : 
                   authentication.authState.isAuthenticating ? 'Authenticating...' : 'Not Authenticated'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Requires Email:</span>
                <div className="font-semibold">
                  {authentication.authState.requiresEmailInput ? 'Yes (enter email)' : 
                   authentication.authState.requiresEmailCode ? 'Yes (enter code)' : 'No'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Email Modal:</span>
                <div className="font-semibold">
                  {showEmailModal ? 'Open' : 'Closed'}
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
            <h4 className="font-medium text-indigo-900 mb-2">Test Actions:</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => authentication.authenticate()}
                disabled={authentication.authState.isAuthenticating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {authentication.authState.isAuthenticating ? 'Authenticating...' : 'Re-Authenticate'}
              </button>
              <button
                onClick={() => authentication.logout()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
              <button
                onClick={() => {
                  authentication.setRequiresEmailInput(true);
                  setShowEmailModal(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Test Email Modal (with email input)
              </button>
              <button
                onClick={async () => {
                  try {
                    await authentication.sendEmailCode('test@example.com');
                    setCurrentEmail('test@example.com');
                    setShowEmailModal(true);
                  } catch (error) {
                    console.error('Failed to send code:', error);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Test Email Modal (code only)
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">?? How It Works:</h4>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>On mount, automatically tries Level 1 (refresh token)</li>
              <li>If failed, tries Level 2 (Windows authentication)</li>
              <li>If Windows auth fails, <strong>email modal opens automatically</strong></li>
              <li>User enters email ? code sent ? user enters code ? authenticated!</li>
              <li>On 401 error during work, same flow repeats automatically</li>
              <li><strong>Backend extracts user info from JWT token</strong> - no hardcoded IDs needed!</li>
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

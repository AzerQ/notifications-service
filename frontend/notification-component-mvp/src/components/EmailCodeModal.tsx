import React, { useState, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import type { EmailCodeVerification } from '../services/authenticationService';

interface EmailCodeModalProps {
  isOpen: boolean;
  challengeId: string;
  challengeMessage?: string;
  email?: string;
  error?: string | null;
  onVerify: (verification: EmailCodeVerification) => Promise<void>;
  onResendCode: (email: string) => Promise<void>;
  onClose: () => void;
  requiresEmailInput?: boolean;
}

/**
 * Modal for entering email verification code
 * Supports two modes:
 * 1. Email known - just enter code
 * 2. Email unknown - enter email first, then code
 */
export const EmailCodeModal: React.FC<EmailCodeModalProps> = ({
  isOpen,
  challengeId,
  challengeMessage,
  email,
  error,
  onVerify,
  onResendCode,
  onClose,
  requiresEmailInput = false,
}) => {
  const [code, setCode] = useState('');
  const [localEmail, setLocalEmail] = useState(email || '');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>(
    requiresEmailInput && !challengeId ? 'email' : 'code'
  );

  // Debug logging
  useEffect(() => {
    console.log('[EmailCodeModal] Props updated:', {
      isOpen,
      challengeId,
      email,
      isVerifying,
      error,
      requiresEmailInput,
      step,
    });
  }, [isOpen, challengeId, email, isVerifying, error, requiresEmailInput, step]);

  // Update step when challengeId changes
  useEffect(() => {
    if (challengeId) {
      setStep('code');
    }
  }, [challengeId]);

  // Update local email when prop changes
  useEffect(() => {
    if (email) {
      setLocalEmail(email);
    }
  }, [email]);

  if (!isOpen) return null;

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!localEmail || !localEmail.includes('@')) {
      return;
    }

    setIsResending(true);
    try {
      await onResendCode(localEmail);
      setStep('code');
      setCode('');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsVerifying(true);
    e.preventDefault();

    if (step === 'email') {
      await handleSendCode();
      return;
    }

    if (code.trim().length === 6 && challengeId) {
      await onVerify({ id: challengeId, code: code.trim() });
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {step === 'email' ? 'Введите вашу электронную почту' : 'Проверка электронной почты'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === 'email' ? (
            /* Step 1: Enter Email */
            <>
              <p className="text-gray-600 text-sm mb-6">
                Аутентификация Windows не удалась. Пожалуйста, введите вашу электронную почту для
                получения кода проверки.
              </p>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Адрес электронной почты
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ваша.почта@example.com"
                    required
                    autoFocus
                    disabled={isResending}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isResending || !localEmail || !localEmail.includes('@')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isResending ? 'Отправка...' : 'Отправить код'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Step 2: Enter Code */
            <>
              <p className="text-gray-600 text-sm mb-6">
                {challengeMessage ||
                  'Код проверки отправлен на вашу электронную почту. Пожалуйста, введите его ниже для продолжения.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес электронной почты
                  </label>
                  <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
                    <span>{localEmail}</span>
                    {requiresEmailInput && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Изменить
                      </button>
                    )}
                  </div>
                </div>

                {/* Code input */}
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Код проверки
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoComplete="off"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Введите 6-значный код из вашей электронной почты
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isResending || !localEmail}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Отправка...' : 'Отправить код повторно'}
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifying || code.length !== 6}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isVerifying ? 'Проверка...' : 'Проверить'}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

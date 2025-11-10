import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createApiClient } from '../../services/apiClient';

interface EmailAuthFormProps {
  onSuccess?: (tokens: { accessToken: string; refreshToken: string }) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface EmailCodeRequest {
  challengeId: string;
  message: string;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  onSuccess,
  onError,
  onCancel
}) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [codeRequest, setCodeRequest] = useState<EmailCodeRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 минут в секундах
  const [timerActive, setTimerActive] = useState(false);

  const apiClient = createApiClient({
    baseUrl: process.env.REACT_APP_API_BASE_URL || '/api'
  });

  // Таймер обратного отсчета
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      setStep('email');
      setError('Время действия кода истекло. Пожалуйста, запросите новый код.');
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendEmailCode(email);
      setCodeRequest(response);
      setStep('code');
      setTimeLeft(600); // Сбрасываем таймер на 10 минут
      setTimerActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при отправке кода';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeRequest) return;

    setIsLoading(true);
    setError(null);

    try {
      const tokens = await apiClient.loginByEmail(codeRequest.challengeId, code);
      onSuccess?.(tokens);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неверный код';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendEmailCode(email);
      setCodeRequest(response);
      setTimeLeft(600); // Сбрасываем таймер на 10 минут
      setTimerActive(true);
      setCode('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при повторной отправке кода';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
    setCodeRequest(null);
    setError(null);
    setTimerActive(false);
  };

  return (
    <div className="p-6 bg-white" data-testid="email-auth-form">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Авторизация по почте
          </h3>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Отмена"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {step === 'email' ? (
        /* Email Input Step */
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email адрес
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="email-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            data-testid="send-code-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <span>Отправить код</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Code Verification Step */
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              Код отправлен на адрес <strong>{email}</strong>
            </p>
            {timerActive && (
              <p className="text-xs text-blue-600 mt-1">
                Код действителен еще: {formatTime(timeLeft)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Код подтверждения
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="000000"
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
              data-testid="code-input"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleBackToEmail}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              data-testid="back-button"
            >
              Назад
            </button>
            
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              data-testid="verify-code-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Проверка...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Подтвердить</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
              data-testid="resend-code-button"
            >
              Отправить код повторно
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
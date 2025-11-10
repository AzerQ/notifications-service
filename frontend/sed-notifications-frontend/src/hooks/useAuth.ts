import { useState, useCallback, useEffect } from 'react';
import { createApiClient, ApiClientConfig } from '../services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authMethod: 'windows' | 'email' | null;
}

interface UseAuthOptions {
  apiConfig: ApiClientConfig;
  onAuthSuccess?: (tokens: { accessToken: string; refreshToken: string }) => void;
  onAuthError?: (error: string) => void;
}

export const useAuth = ({ 
  apiConfig, 
  onAuthSuccess, 
  onAuthError 
}: UseAuthOptions) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    authMethod: null
  });

  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [apiClient] = useState(() => createApiClient(apiConfig));

  // Проверяем состояние авторизации при монтировании
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Настраиваем обработчик неудачной авторизации в ApiClient
  useEffect(() => {
    apiClient.config.onUnauthenticated = handleUnauthenticated;
  }, [apiClient]);

  const checkAuthStatus = useCallback(() => {
    const isAuth = apiClient.isAuthenticated();
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: isAuth,
      isLoading: false
    }));
  }, [apiClient]);

  const handleUnauthenticated = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      error: 'Требуется авторизация',
      authMethod: null
    }));
    setShowEmailAuth(true);
    onAuthError?.('Требуется авторизация');
  }, [onAuthError]);

  const tryWindowsAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // В ApiClient уже есть логика попытки Windows-авторизации
      // при обновлении токена, но мы можем вызвать ее явно
      const response = await apiClient.tryWindowsAuthentication();
      
      if (response) {
        apiClient.setTokens(response.accessToken, response.refreshToken);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          error: null,
          authMethod: 'windows'
        });
        setShowEmailAuth(false);
        onAuthSuccess?.(response);
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка Windows-авторизации';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      onAuthError?.(errorMessage);
      return false;
    }
  }, [apiClient, onAuthSuccess, onAuthError]);

  const handleEmailAuthSuccess = useCallback((tokens: { accessToken: string; refreshToken: string }) => {
    apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      authMethod: 'email'
    });
    setShowEmailAuth(false);
    onAuthSuccess?.(tokens);
  }, [apiClient, onAuthSuccess]);

  const handleEmailAuthError = useCallback((error: string) => {
    setAuthState(prev => ({
      ...prev,
      error
    }));
    onAuthError?.(error);
  }, [onAuthError]);

  const logout = useCallback(() => {
    apiClient.clearTokens();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authMethod: null
    });
    setShowEmailAuth(false);
  }, [apiClient]);

  const retryAuth = useCallback(async () => {
    // Сначала пробуем Windows-авторизацию
    const windowsSuccess = await tryWindowsAuth();
    
    // Если Windows-авторизация не удалась, показываем форму email-авторизации
    if (!windowsSuccess) {
      setShowEmailAuth(true);
    }
  }, [tryWindowsAuth]);

  const dismissEmailAuth = useCallback(() => {
    setShowEmailAuth(false);
  }, []);

  // Инициализация - пробуем Windows-авторизацию
  useEffect(() => {
    if (!authState.isAuthenticated && !authState.isLoading) {
      tryWindowsAuth();
    }
  }, []);

  return {
    // Состояние
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    authMethod: authState.authMethod,
    showEmailAuth,
    
    // Методы
    tryWindowsAuth,
    handleEmailAuthSuccess,
    handleEmailAuthError,
    logout,
    retryAuth,
    dismissEmailAuth,
    checkAuthStatus,
    
    // ApiClient для прямого использования
    apiClient
  };
};
import { useState, useEffect, useCallback } from 'react';
import { 
  AuthenticationService, 
  AuthTokens, 
  EmailChallengeResponse,
  EmailCodeVerification,
  AuthServiceConfig
} from '../services/authenticationService';

/**
 * Authentication state
 */
interface AuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
  emailChallengeId: string | null;
  emailChallengeMessage: string | null;
  requiresEmailCode: boolean;
  requiresEmailInput: boolean; // NEW: ��� ������� email ������
}

/**
 * Hook options
 */
interface UseAuthenticationOptions extends AuthServiceConfig {
  autoAuthenticate?: boolean;
  userEmail?: string; // ������������ email ������������
}

/**
 * Hook return type
 */
export interface UseAuthenticationReturn {
  // State
  authState: AuthState;
  authService: AuthenticationService;

  // Methods
  authenticate: () => Promise<AuthTokens | null>;
  sendEmailCode: (email: string) => Promise<EmailChallengeResponse>;
  verifyEmailCode: (verification: EmailCodeVerification) => Promise<AuthTokens>;
  logout: () => void;
  clearError: () => void;
  setRequiresEmailInput: (requires: boolean) => void;
}

/**
 * Hook for managing authentication with automatic multi-level fallback
 * 
 * @example
 * ```tsx
 * const { authState, authenticate, sendEmailCode, verifyEmailCode } = useAuthentication({
 *   apiBaseUrl: 'http://localhost:5093',
 *   autoAuthenticate: true,
 *   onAuthSuccess: (tokens) => console.log('Authenticated!'),
 *   onEmailCodeRequired: (email, challengeId) => setShowEmailModal(true)
 * });
 * ```
 */
export function useAuthentication(options: UseAuthenticationOptions): UseAuthenticationReturn {
  const { autoAuthenticate = true, userEmail, ...serviceConfig } = options;

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAuthenticating: false,
    error: null,
    emailChallengeId: null,
    emailChallengeMessage: null,
    requiresEmailCode: false,
    requiresEmailInput: false,
  });

  // Create authentication service with callbacks
  const [authService] = useState(() => {
    return new AuthenticationService({
      ...serviceConfig,
      onAuthSuccess: (tokens: AuthTokens) => {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
   isAuthenticating: false,
      error: null,
          requiresEmailCode: false,
      requiresEmailInput: false,
          emailChallengeId: null,
          emailChallengeMessage: null,
   }));
    serviceConfig.onAuthSuccess?.(tokens);
},
      onAuthFailure: (error: string) => {
        setAuthState(prev => ({
      ...prev,
     isAuthenticated: false,
     isAuthenticating: false,
 error,
          requiresEmailCode: error === 'Email code authentication required',
     requiresEmailInput: error === 'Email code authentication required' && !userEmail,
        }));
        serviceConfig.onAuthFailure?.(error);
      },
      onEmailCodeRequired: (email: string, challengeId: string) => {
    setAuthState(prev => ({
        ...prev,
          requiresEmailCode: true,
          emailChallengeId: challengeId,
    requiresEmailInput: false, // ��� ���� challenge, ������ ��� �����
}));
        serviceConfig.onEmailCodeRequired?.(email, challengeId);
   },
    });
  });

  // Authenticate method
  const authenticate = useCallback(async (): Promise<AuthTokens | null> => {
    setAuthState(prev => ({ ...prev, isAuthenticating: true, error: null }));
  
    try {
      const tokens = await authService.authenticate();
      
      // ���� ������� ��� � ����� email ���, ������������� ����������� email
      if (!tokens && userEmail) {
        console.log('[useAuthentication] Auto-requesting email code for:', userEmail);
   try {
 await sendEmailCode(userEmail);
        } catch (emailError) {
          console.error('[useAuthentication] Failed to auto-send email code:', emailError);
      }
      }
      
   return tokens;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
isAuthenticating: false,
    error: errorMessage,
   }));
    return null;
    }
  }, [authService, userEmail]);

  // Send email code
  const sendEmailCode = useCallback(async (email: string): Promise<EmailChallengeResponse> => {
    setAuthState(prev => ({ ...prev, error: null, isAuthenticating: true }));
    
    try {
      const challenge = await authService.sendEmailCode(email);
      setAuthState(prev => ({
        ...prev,
        emailChallengeId: challenge.challengeId,
 emailChallengeMessage: challenge.message,
        requiresEmailCode: true,
requiresEmailInput: false,
        isAuthenticating: false,
      }));
      return challenge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email code';
      setAuthState(prev => ({ 
     ...prev, 
        error: errorMessage,
     isAuthenticating: false,
      }));
      throw error;
    }
  }, [authService]);

  // Verify email code
  const verifyEmailCode = useCallback(async (
    verification: EmailCodeVerification
  ): Promise<AuthTokens> => {
    console.log('[useAuthentication] Starting email code verification...', verification);
    setAuthState(prev => {
      console.log('[useAuthentication] Setting isAuthenticating = true');
      return { ...prev, isAuthenticating: true, error: null };
    });
    
    try {
      console.log('[useAuthentication] Calling authService.verifyEmailCode...');
      const tokens = await authService.verifyEmailCode(verification);
    console.log('[useAuthentication] Verification successful, tokens received');
      
      // ����� - ��������� ���������
      setAuthState(prev => {
    console.log('[useAuthentication] Setting success state: isAuthenticating = false, isAuthenticated = true');
        return {
...prev,
        isAuthenticated: true,
          isAuthenticating: false,
          requiresEmailCode: false,
    requiresEmailInput: false,
   emailChallengeId: null,
          emailChallengeMessage: null,
      error: null,
        };
      });
 
      console.log('[useAuthentication] State updated, returning tokens');
      return tokens;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email code verification failed';
      console.error('[useAuthentication] Verification failed:', errorMessage);
      
      // ������ - ���������� isAuthenticating � ������������� ������
      setAuthState(prev => {
        console.log('[useAuthentication] Setting error state: isAuthenticating = false, error =', errorMessage);
        return {
          ...prev,
        isAuthenticating: false,
          error: errorMessage,
        };
      });
      
console.log('[useAuthentication] Returning rejected promise');
      // ���������� rejected promise ������ throw, ����� ��������� ������ ����������
      return Promise.reject(new Error(errorMessage));
    }
  }, [authService]);

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      isAuthenticating: false,
      error: null,
      emailChallengeId: null,
      emailChallengeMessage: null,
      requiresEmailCode: false,
      requiresEmailInput: false,
    });
  }, [authService]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Set requires email input
  const setRequiresEmailInput = useCallback((requires: boolean) => {
    setAuthState(prev => ({ ...prev, requiresEmailInput: requires }));
  }, []);

  // Auto-authenticate on mount if enabled
  useEffect(() => {
    if (autoAuthenticate && !authState.isAuthenticated && !authState.isAuthenticating) {
      authenticate();
    }
  }, [autoAuthenticate, authState.isAuthenticated, authState.isAuthenticating, authenticate]);

  return {
    authState,
    authService,
    authenticate,
    sendEmailCode,
  verifyEmailCode,
    logout,
    clearError,
    setRequiresEmailInput,
  };
}

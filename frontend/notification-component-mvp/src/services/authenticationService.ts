import axios, { AxiosInstance } from 'axios';

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Email challenge response
 */
export interface EmailChallengeResponse {
  challengeId: string;
  message: string;
}

/**
 * Email code verification request
 */
export interface EmailCodeVerification {
  id: string;
  code: string;
}

/**
 * Authentication service configuration
 */
export interface AuthServiceConfig {
  apiBaseUrl: string;
  onAuthSuccess?: (tokens: AuthTokens) => void;
  onAuthFailure?: (error: string) => void;
  onEmailCodeRequired?: (email: string, challengeId: string) => void;
}

/**
 * Authentication service with automatic multi-level authentication:
 * 1. Try to refresh using refresh token
 * 2. Try Windows authentication
 * 3. Fall back to email code authentication
 */
export class AuthenticationService {
  private client: AxiosInstance;
  private config: AuthServiceConfig;
  private isAuthenticating = false;
  private authQueue: Array<{
    resolve: (tokens: AuthTokens | null) => void;
    reject: (error: Error) => void;
  }> = [];
  private lastAuthAttempt = 0;
  private readonly AUTH_COOLDOWN_MS = 5000; // 5 seconds cooldown between auth attempts

  constructor(config: AuthServiceConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get stored access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Store authentication tokens in localStorage
   */
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    this.config.onAuthSuccess?.(tokens);
  }

  /**
   * Clear authentication tokens from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Automatic authentication with multi-level fallback strategy
   * Returns tokens if successful, null otherwise
   */
  async authenticate(): Promise<AuthTokens | null> {
    // Cooldown check - prevent too frequent auth attempts
    const now = Date.now();
    if (now - this.lastAuthAttempt < this.AUTH_COOLDOWN_MS) {
      console.log(`[Auth] Cooldown period active. Please wait ${Math.ceil((this.AUTH_COOLDOWN_MS - (now - this.lastAuthAttempt)) / 1000)}s`);
      return null;
    }

    // If already authenticating, queue this request
    if (this.isAuthenticating) {
      console.log('[Auth] Already authenticating, queueing request...');
      return new Promise((resolve, reject) => {
        this.authQueue.push({ resolve, reject });
      });
    }

    this.isAuthenticating = true;
    this.lastAuthAttempt = now;

    try {
      // Level 1: Try to refresh using refresh token
      console.log('[Auth] Level 1: Attempting refresh token authentication...');
      const refreshTokens = await this.tryRefreshToken();
      if (refreshTokens) {
        console.log('[Auth] Level 1: ? Refresh token authentication successful');
        this.setTokens(refreshTokens);
        this.processAuthQueue(refreshTokens);
        return refreshTokens;
      }
      console.log('[Auth] Level 1: ? Refresh token authentication failed');

      // Level 2: Try Windows authentication
      console.log('[Auth] Level 2: Attempting Windows authentication...');
      const windowsTokens = await this.tryWindowsAuthentication();
      if (windowsTokens) {
        console.log('[Auth] Level 2: ? Windows authentication successful');
        this.setTokens(windowsTokens);
        this.processAuthQueue(windowsTokens);
        return windowsTokens;
      }
      console.log('[Auth] Level 2: ? Windows authentication failed');

      // Level 3: Email code required - notify caller
      console.log('[Auth] Level 3: Email code authentication required');
      this.processAuthQueue(null);
      this.config.onAuthFailure?.('Email code authentication required');
      
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[Auth] Authentication error:', errorMessage);
      this.processAuthQueue(null, error as Error);
      this.config.onAuthFailure?.(errorMessage);
      return null;
    } finally {
      this.isAuthenticating = false;
    }
  }

  /**
   * Level 1: Try to refresh access token using stored refresh token
   */
  private async tryRefreshToken(): Promise<AuthTokens | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.log('[Auth] No refresh token available');
      return null;
    }

    try {
      const response = await this.client.post<{ accessToken: string }>(
        '/api/auth/refresh',
        { refreshTokenValue: refreshToken }
      );

      // Refresh endpoint returns only new access token, keep existing refresh token
      return {
        accessToken: response.data.accessToken,
        refreshToken: refreshToken
      };
    } catch (error) {
      console.error('[Auth] Refresh token failed:', error);
      // Clear invalid refresh token
      this.clearTokens();
      return null;
    }
  }

  /**
   * Level 2: Try Windows authentication (uses browser's Windows credentials)
   */
  private async tryWindowsAuthentication(): Promise<AuthTokens | null> {
    try {
      const response = await axios.post<AuthTokens>(
        `${this.config.apiBaseUrl}/api/auth/windows`,
        null,
        {
          withCredentials: true, // Send Windows credentials
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[Auth] Windows authentication failed:', error);
      return null;
    }
  }

  /**
   * Level 3: Send email verification code
   * This is the final fallback - requires user interaction
   */
  async sendEmailCode(email: string): Promise<EmailChallengeResponse> {
    try {
      const response = await this.client.post<EmailChallengeResponse>(
        '/api/auth/email/sendCode',
        null,
        { params: { email } }
      );

      const challenge = response.data;
      console.log('[Auth] Email code sent:', challenge.message);
      
      // Notify that email code is required
      this.config.onEmailCodeRequired?.(email, challenge.challengeId);
      
      return challenge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email code';
      console.error('[Auth] Email code send failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Level 3: Verify email code and complete authentication
   */
  async verifyEmailCode(verification: EmailCodeVerification): Promise<AuthTokens> {
    console.log('[AuthService] Verifying email code:', { id: verification.id, codeLength: verification.code.length });
    
    try {
      const response = await this.client.post<AuthTokens>(
        '/api/auth/email',
        verification
      );

      console.log('[AuthService] Verification response received:', response.status);
      const tokens = response.data;
      this.setTokens(tokens);
      console.log('[AuthService] Email code verification successful, tokens stored');
      
      return tokens;
    } catch (error) {
      console.error('[AuthService] Email code verification failed:', error);
      
      // Подробное логирование ошибки
      if (axios.isAxiosError(error)) {
    console.error('[AuthService] Axios error details:', {
       status: error.response?.status,
  statusText: error.response?.statusText,
          data: error.response?.data,
    message: error.message
        });
      }
  
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
     ? error.response.data.message
        : error instanceof Error 
          ? error.message 
          : 'Email code verification failed';
   
      console.error('[AuthService] Throwing error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Process queued authentication requests
   */
  private processAuthQueue(tokens: AuthTokens | null, error?: Error): void {
    this.authQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(tokens);
      }
    });
    this.authQueue = [];
  }

  /**
   * Logout - clear tokens and reset state
   */
  logout(): void {
    this.clearTokens();
    this.lastAuthAttempt = 0;
    console.log('[Auth] User logged out');
  }
}

/**
 * Create authentication service instance
 */
export function createAuthenticationService(
  config: AuthServiceConfig
): AuthenticationService {
  return new AuthenticationService(config);
}

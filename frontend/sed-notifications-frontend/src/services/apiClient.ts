import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  onUnauthenticated?: () => void;
}

/**
 * Token response from authentication endpoints
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshTokenValue: string;
}

/**
 * Access token response
 */
export interface AccessTokenResponse {
  accessToken: string;
}

/**
 * Email code request response
 */
export interface EmailCodeRequestResponse {
  challengeId: string;
  message: string;
}

/**
 * API Client with automatic token refresh interceptor
 * 
 * Authentication flow:
 * 1. If access token is expired, try to refresh using refresh token
 * 2. If refresh token is expired/invalid, try Windows authentication
 * 3. If Windows authentication fails, fallback to email authentication (handled by callback)
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  public config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get the axios instance for direct use
   */
  public get instance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add access token to headers
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Try to refresh token
            const newToken = await this.refreshAccessToken();
            
            if (newToken) {
              // Update token and retry all queued requests
              this.setAccessToken(newToken);
              this.processQueue(null);
              
              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, try Windows authentication
            try {
              const windowsTokens = await this.tryWindowsAuthentication();
              
              if (windowsTokens) {
                this.setTokens(windowsTokens.accessToken, windowsTokens.refreshToken);
                this.processQueue(null);
                
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${windowsTokens.accessToken}`;
                }
                return this.axiosInstance(originalRequest);
              }
            } catch (windowsError) {
              // Windows authentication failed, clear tokens and notify
              this.clearTokens();
              this.processQueue(windowsError);
              
              // Notify the application that user needs to re-authenticate via email
              if (this.config.onUnauthenticated) {
                this.config.onUnauthenticated();
              }
              
              return Promise.reject(windowsError);
            }
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Set access token in localStorage
   */
  private setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  /**
   * Set both tokens in localStorage
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Clear all tokens from localStorage
   */
  public clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Try to refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post<AccessTokenResponse>(
        `${this.config.baseUrl}/api/auth/refresh`,
        { refreshTokenValue: refreshToken } as RefreshTokenRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.accessToken;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return null;
    }
  }

  /**
   * Try Windows authentication
   * Uses credentials: 'include' to send Windows credentials
   */
  public async tryWindowsAuthentication(): Promise<TokenResponse | null> {
    try {
      const response = await axios.post<TokenResponse>(
        `${this.config.baseUrl}/api/auth/windows`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Include credentials for Windows authentication
        }
      );

      return response.data;
    } catch (error) {
      console.error('Windows authentication failed:', error);
      return null;
    }
  }

  /**
   * Email authentication - send verification code
   */
  public async sendEmailCode(email: string): Promise<{ challengeId: string; message: string }> {
    const response = await axios.post(
      `${this.config.baseUrl}/api/auth/email/sendCode`,
      null,
      {
        params: { email },
      }
    );
    return response.data;
  }

  /**
   * Email authentication - verify code and get tokens
   */
  public async loginByEmail(id: string, code: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(
      `${this.config.baseUrl}/api/auth/email`,
      { id, code }
    );
    
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

/**
 * Create a default API client instance
 */
export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient(config);
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';

  private baseUrl: string;

  constructor(baseUrl: string = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  /**
   * Сохранить токены в localStorage
   */
  setTokens(tokens: AuthTokens): void {
    const expiryTime = Date.now() + (tokens.expiresIn * 1000);
    localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(AuthService.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  /**
   * Получить access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
  }

  /**
   * Получить refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }

  /**
   * Проверить, истек ли токен
   */
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(AuthService.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  }

  /**
   * Очистить токены
   */
  clearTokens(): void {
    localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
    localStorage.removeItem(AuthService.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AuthService.TOKEN_EXPIRY_KEY);
  }

  /**
   * Обновить токен с помощью refresh token
   */
  async refreshToken(): Promise<AuthTokens | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const tokens: AuthTokens = await response.json();
      this.setTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return !this.isTokenExpired() && !!this.getAccessToken();
  }
}
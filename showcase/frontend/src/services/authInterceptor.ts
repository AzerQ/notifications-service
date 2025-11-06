import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { RefreshTokenRequest, AccessTokenResponse } from '../types';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  updateAccessToken(token: string): void;
  logout(): void;
}

export class AuthInterceptor {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(private api: AxiosInstance, private authStore: AuthStore) {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - добавляем токен к каждому запросу
    this.api.interceptors.request.use((config) => {
      const token = this.authStore.accessToken || localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - обрабатываем ошибки аутентификации
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Если уже идет процесс обновления токена, ставим запрос в очередь
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers!.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            
            // Повторяем оригинальный запрос с новым токеном
            originalRequest.headers!.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.authStore.logout();
            
            // Перенаправляем на страницу входа
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.authStore.refreshToken || localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshRequest: RefreshTokenRequest = {
      refreshTokenValue: refreshToken
    };

    try {
      const response = await this.api.post<AccessTokenResponse>('/auth/refresh', refreshRequest);
      const newAccessToken = response.data.accessToken;
      
      // Обновляем токен через метод store
      this.authStore.updateAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error) {
      // Удаляем недействительные токены
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      throw new Error('Failed to refresh access token');
    }
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    
    this.failedQueue = [];
  }
}

// Расширяем тип AxiosRequestConfig для поддержки _retry
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
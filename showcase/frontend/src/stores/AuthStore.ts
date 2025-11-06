import { makeAutoObservable } from 'mobx';
import { authApi } from '../services/api';
import type { User, CreatedMailChallengeResponse, MailChallengeSubmit } from '../types';

export class AuthStore {
  user: User | null = null;
  accessToken: string | null = null;
  refreshToken: string | null = null;
  loading = false;
  error: string | null = null;
  
  // For email code verification flow
  currentChallenge: CreatedMailChallengeResponse | null = null;
  currentEmail: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    if (accessToken && refreshToken && userStr) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = JSON.parse(userStr);
    }
  }

  async sendVerificationCode(email: string) {
    this.loading = true;
    this.error = null;
    try {
      const challenge = await authApi.sendCode(email);
      this.currentChallenge = challenge;
      this.currentEmail = email;
    } catch (error: any) {
      this.error = error.response?.data?.message || 'Failed to send verification code';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async verifyCode(code: string) {
    this.loading = true;
    this.error = null;
    try {
      if (!this.currentChallenge) {
        throw new Error('No active challenge');
      }

      const mailChallengeSubmit: MailChallengeSubmit = {
        id: this.currentChallenge.challengeId,
        code: code,
      };

      const response = await authApi.verifyCode(mailChallengeSubmit);
      
      this.accessToken = response.accessToken;
      this.refreshToken = response.refreshToken;
      
      // Extract user info from JWT token (basic parsing)
      const userInfo = this.extractUserFromToken(response.accessToken);
      this.user = userInfo;

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Clear challenge after successful verification
      this.currentChallenge = null;
      this.currentEmail = null;
    } catch (error: any) {
      this.error = error.response?.data?.message || 'Code verification failed';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  private extractUserFromToken(token: string): User {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const decoded = JSON.parse(atob(parts[1]));
      
      return {
        id: decoded.sub || decoded.userId || '',
        name: decoded.name || decoded.email || '',
        email: decoded.email || this.currentEmail || '',
        role: decoded.role,
      };
    } catch (error) {
      console.error('Failed to extract user from token:', error);
      return {
        id: '',
        name: this.currentEmail || '',
        email: this.currentEmail || '',
      };
    }
  }

  logout() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.currentChallenge = null;
    this.currentEmail = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  get isAuthenticated() {
    return !!this.accessToken && !!this.user;
  }

  get hasActiveChallenge() {
    return !!this.currentChallenge;
  }
}

import { makeAutoObservable } from 'mobx';
import { authApi } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../types';

export class AuthStore {
  user: User | null = null;
  token: string | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      this.token = token;
      this.user = JSON.parse(userStr);
    }
  }

  async login(data: LoginRequest) {
    this.loading = true;
    this.error = null;
    try {
      const response = await authApi.login(data);
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      this.error = error.response?.data?.message || 'Login failed';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async register(data: RegisterRequest) {
    this.loading = true;
    this.error = null;
    try {
      const response = await authApi.register(data);
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      this.error = error.response?.data?.message || 'Registration failed';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  get isAuthenticated() {
    return !!this.token && !!this.user;
  }
}

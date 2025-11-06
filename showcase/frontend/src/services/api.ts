import axios from 'axios';
import type {
  AuthResponse,
  Notification,
  User,
  CreatedMailChallengeResponse,
  MailChallengeSubmit
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  sendCode: async (email: string): Promise<CreatedMailChallengeResponse> => {
    const response = await api.post<CreatedMailChallengeResponse>(
      '/auth/email/sendCode',
      {},
      { params: { email } }
    );
    return response.data;
  },

  verifyCode: async (data: MailChallengeSubmit): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/email', data);
    return response.data;
  },
};

export const notificationApi = {
  getByUser: async (userId: string): Promise<Notification[]> => {
    const response = await api.get<Notification[]>(`/notification/by-user/${userId}`);
    return response.data;
  },
  
  send: async (params: {route: string, data:any}): Promise<any> => {
    const response = await api.post(`/notification/${params.route}`, params.data);
    return response.data;
  },
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  
  getById: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users?userId=${userId}`);
    return response.data;
  },
};

export default api;

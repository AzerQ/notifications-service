export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  route: string;
  createdAt: string;
  userId?: string;
  read?: boolean;
}

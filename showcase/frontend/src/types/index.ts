export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreatedMailChallengeResponse {
  challengeId: string;
  expiresAt: string;
}

export interface MailChallengeSubmit {
  id: string;
  code: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
}

export interface CodeVerificationRequest {
  challengeId: string;
  code: string;
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

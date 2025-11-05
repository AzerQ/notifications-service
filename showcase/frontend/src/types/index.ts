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

// Notification action for InApp notifications
export interface NotificationAction {
  name: string;
  label: string;
  url: string;
}

// Notification parameter with key-value-description structure
export interface NotificationParameter {
  key: string;
  value: string;
  description: string;
}

// InApp notification matching backend structure
export interface Notification {
  id: string;
  type?: string;
  title: string;
  content: string;
  contentShortTemplate?: string;
  data?: any;
  date: string;
  read: boolean;
  author?: string;
  actions?: NotificationAction[];
  hashtags?: string[];
  parameters?: NotificationParameter[];
  
  // Backward compatibility - computed/alias fields
  message?: string; // alias for content
  route?: string; // alias for type
  createdAt?: string; // alias for date
  userId?: string; // for filtering
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN' | 'CUSTOMER';
  premiumStatus: boolean;
  premiumExpiry?: Date;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'USER' | 'SELLER';
}

export interface AuthResponse {
  userId: number;
  role: string;
  name: string;
  premium: boolean;
}
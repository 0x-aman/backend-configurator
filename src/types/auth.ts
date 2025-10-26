// Authentication types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    companyName?: string;
  };
  token: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

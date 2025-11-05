// Authentication types
import { SubscriptionStatus, SubscriptionDuration } from '@prisma/client';

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

// Client profile type for authenticated users
export interface ClientProfile {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionDuration?: SubscriptionDuration | null;
  subscriptionEndsAt?: string | null;
  trialEndsAt?: string | null;
  hasPassword: boolean;
  hasGoogleLinked: boolean;
  allowedDomains: string[];
  monthlyRequests: number;
  requestLimit: number;
  createdAt: string;
  lastLoginAt?: string | null;
  stripeCustomerId?: string | null;
  // API keys for embed/integration management
  publicKey?: string;
  apiKey?: string;
  domain?: string | null;
}

// NextAuth error types
export type NextAuthError = 
  | 'OAuthAccountNotLinked'
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'EmailSignin'
  | 'CredentialsSignin'
  | 'SessionRequired'
  | 'Default';

export interface AuthError {
  error: NextAuthError | string;
  errorDescription?: string;
}

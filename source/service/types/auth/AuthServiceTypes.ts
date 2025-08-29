/**
 * Auth Service Types
 * 
 * Core authentication service types.
 */

/**
 * Authentication error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  WEAK_PASSWORD = 'weak_password',
  INVALID_EMAIL = 'invalid_email',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  NETWORK_ERROR = 'network_error',
  RATE_LIMITED = 'rate_limited',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Authentication method types
 */
export enum AuthMethod {
  EMAIL_PASSWORD = 'email_password',
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  MAGIC_LINK = 'magic_link',
  PHONE = 'phone'
}

/**
 * Authentication service configuration
 */
export interface AuthServiceConfig {
  enableSocialAuth: boolean;
  enableMagicLink: boolean;
  enablePhoneAuth: boolean;
  sessionTimeout: number;
  refreshThreshold: number;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Authentication request types
 */
export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
  metadata?: Record<string, unknown>;
}

export interface PasswordResetRequest {
  email: string;
  redirectUrl?: string;
}

export interface SocialAuthRequest {
  provider: AuthMethod;
  redirectUrl?: string;
}

/**
 * Authentication response types
 */
export interface AuthResponse {
  success: boolean;
  user?: ServiceUser;
  session?: ServiceSession;
  error?: AuthError;
}

export interface ServiceUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ServiceSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
  scope?: string;
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: Record<string, unknown>;
}

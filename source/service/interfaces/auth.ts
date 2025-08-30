/**
 * Auth Service Layer Interfaces
 * 
 * This file contains auth-related interfaces used in the service layer.
 */

// ============================================================================
// AUTH ERROR TYPES
// ============================================================================

export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ICategorizedAuthError {
  type: AuthErrorType;
  message: string;
  isRetryable: boolean;
  isNetworkError: boolean;
  originalError?: unknown;
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface IValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IEmailValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IPasswordValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IPasswordStrengthResult {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
}

export interface ITokenValidationResult {
  isValid: boolean;
  error?: string;
  tokenType?: 'reset' | 'verification' | 'unknown';
  isExpired?: boolean;
  expiresAt?: Date;
}

export interface IDecodedToken {
  sub: string; // Subject (user ID)
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at time (Unix timestamp)
  aud: string; // Audience
  iss: string; // Issuer
  email?: string;
  role?: string;
  [key: string]: unknown;
}

// ============================================================================
// PERMISSION INTERFACES
// ============================================================================

export interface IPermissionCheckResult {
  hasAccess: boolean;
  missingPermissions: string[];
  reason?: string;
}

// ============================================================================
// MESSAGE VALIDATION INTERFACES
// ============================================================================

export interface IMessageValidator {
  validateContent(content: string): IValidationResult;
  validateMessageId(messageId: string): IValidationResult;
  validateRoomId(roomId: string): IValidationResult;
}

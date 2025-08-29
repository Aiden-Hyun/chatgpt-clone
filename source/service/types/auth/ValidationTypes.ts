/**
 * Auth Validation Types
 * 
 * Types for authentication validation in the service layer.
 */

/**
 * Email validation result
 */
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
}

/**
 * Password reset validation result
 */
export interface PasswordResetValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  error?: string;
  payload?: Record<string, unknown>;
}

/**
 * Route permission validation result
 */
export interface RoutePermissionResult {
  hasAccess: boolean;
  requiredPermissions: string[];
  userPermissions: string[];
  missingPermissions: string[];
}

/**
 * Validation rule interface
 */
export interface ValidationRule<T = unknown> {
  name: string;
  validate: (value: T) => boolean;
  message: string;
}

/**
 * Password strength requirements
 */
export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

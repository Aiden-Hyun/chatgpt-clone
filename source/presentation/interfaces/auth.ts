/**
 * Auth Presentation Interfaces
 * 
 * All authentication-related interfaces for the presentation layer.
 */

import * as React from 'react';

import { BaseComponentProps, FormState, FormSubmissionResult } from './shared';

// ============================================================================
// USER SESSION INTERFACES - From business layer
// ============================================================================

/**
 * Abstract user session interface for the presentation layer
 * Based on business layer IUserSession
 */
export interface IUserSession {
  /**
   * Unique identifier for the authenticated user
   */
  readonly userId: string;

  /**
   * Access token for API authentication
   * Used for making authenticated requests to external services
   */
  readonly accessToken: string;

  /**
   * Session expiration timestamp
   * When this session will no longer be valid
   */
  readonly expiresAt: Date;

  /**
   * Optional user email for business logic that requires it
   * (e.g., email-based authorization, notifications)
   */
  readonly userEmail?: string;

  /**
   * Session creation timestamp
   * When this session was initially created
   */
  readonly createdAt: Date;

  /**
   * Check if the session is currently valid
   * 
   * @returns true if session is valid and not expired
   */
  isValid(): boolean;

  /**
   * Check if the session is expired
   * 
   * @returns true if session has expired
   */
  isExpired(): boolean;

  /**
   * Get time remaining until session expires
   * 
   * @returns milliseconds until expiration, or 0 if already expired
   */
  getTimeToExpiry(): number;

  /**
   * Check if session will expire within the given timeframe
   * 
   * @param withinMs - milliseconds to check ahead
   * @returns true if session expires within the given timeframe
   */
  expiresWithin(withinMs: number): boolean;
}

/**
 * User session entity implementation
 */
export class UserSession implements IUserSession {
  constructor(
    public readonly userId: string,
    public readonly accessToken: string,
    public readonly expiresAt: Date,
    public readonly userEmail?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  isValid(): boolean {
    return !this.isExpired() && this.accessToken.length > 0;
  }

  isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  getTimeToExpiry(): number {
    const now = new Date().getTime();
    const expiry = this.expiresAt.getTime();
    return Math.max(0, expiry - now);
  }

  expiresWithin(withinMs: number): boolean {
    return this.getTimeToExpiry() <= withinMs;
  }
}

/**
 * User session data interface
 */
export interface UserSessionData {
  userId: string;
  accessToken: string;
  expiresAt: Date;
  userEmail?: string;
  createdAt?: Date;
}

/**
 * User session entity for the presentation layer
 * This is referenced in the import error for 'business/session/entities/UserSession'
 */
export interface UserSessionEntity {
  userId: string;
  accessToken: string;
  expiresAt: Date;
  userEmail?: string;
  createdAt: Date;
  isValid(): boolean;
  isExpired(): boolean;
  getTimeToExpiry(): number;
  expiresWithin(withinMs: number): boolean;
}

// ============================================================================
// PASSWORD RESET VIEW MODEL - From business layer
// ============================================================================

/**
 * Password reset request parameters
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Password reset view model interface
 */
export interface UseRequestPasswordResetViewModel {
  /**
   * Request password reset for the given email
   */
  requestReset: (email: string) => Promise<PasswordResetResponse>;
  
  /**
   * Check if request is in progress
   */
  isLoading: boolean;
  
  /**
   * Error message if request failed
   */
  error: string | null;
  
  /**
   * Success message if request succeeded
   */
  success: string | null;
  
  /**
   * Reset the view model state
   */
  reset: () => void;
}

// ============================================================================
// AUTH CONTEXT INTERFACES
// ============================================================================

/**
 * Auth context type (extracted from AuthContext.tsx)
 */
export interface AuthContextType {
  session: IUserSession | null; // Updated to use IUserSession
  isLoading: boolean;
}

/**
 * Auth provider props (extracted from AuthContext.tsx)
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

// ============================================================================
// AUTH FORM INTERFACES
// ============================================================================

/**
 * Sign in form values
 */
export interface SignInFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Sign up form values
 */
export interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  acceptTerms?: boolean;
}

/**
 * Password reset form values
 */
export interface PasswordResetFormValues {
  email: string;
}

/**
 * Auth form state
 */
export interface AuthFormState extends FormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

// ============================================================================
// AUTH COMPONENT INTERFACES
// ============================================================================

/**
 * Login form component props
 */
export interface LoginFormProps extends BaseComponentProps {
  onSubmit: (values: SignInFormValues) => Promise<FormSubmissionResult>;
  initialValues?: Partial<SignInFormValues>;
  isLoading?: boolean;
}

/**
 * Sign up form component props
 */
export interface SignUpFormProps extends BaseComponentProps {
  onSubmit: (values: SignUpFormValues) => Promise<FormSubmissionResult>;
  initialValues?: Partial<SignUpFormValues>;
  isLoading?: boolean;
}

/**
 * Password reset form component props
 */
export interface PasswordResetFormProps extends BaseComponentProps {
  onSubmit: (values: PasswordResetFormValues) => Promise<FormSubmissionResult>;
  initialValues?: Partial<PasswordResetFormValues>;
  isLoading?: boolean;
}

/**
 * Protected route component props
 */
export interface ProtectedRouteProps extends BaseComponentProps {
  requiredPermissions?: string[];
  unauthorizedRedirect?: string;
  unauthenticatedRedirect?: string;
  showLoading?: boolean;
}

/**
 * Auth redirect component props
 */
export interface AuthRedirectProps extends BaseComponentProps {
  to: string;
  replace?: boolean;
}

// ============================================================================
// AUTH NAVIGATION INTERFACES
// ============================================================================

/**
 * Auth navigation options
 */
export interface AuthNavigationOptions {
  redirectTo?: string;
  replace?: boolean;
  params?: Record<string, string>;
}

// ============================================================================
// AUTH HOOK INTERFACES
// ============================================================================

/**
 * Auth hook return type
 */
export interface UseAuthReturn {
  session: IUserSession | null; // Updated to use IUserSession
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  accessToken: string | null;
  isExpired: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

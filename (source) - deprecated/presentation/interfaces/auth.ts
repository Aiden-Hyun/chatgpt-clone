/**
 * Auth Presentation Interfaces
 * 
 * All authentication-related interfaces for the presentation layer.
 */

import * as React from 'react';

import { FormState } from './shared';

// ============================================================================
// AUTH PROVIDER TYPES
// ============================================================================

/**
 * Authentication provider types
 */
export type AuthProvider = 'google' | 'apple' | 'github';

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
 * Login form values (alias for SignInFormValues)
 */
export interface LoginFormValues {
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
 * Password reset request values (alias for PasswordResetFormValues)
 */
export interface PasswordResetRequestValues {
  email: string;
}

/**
 * Reset form values for password reset
 */
export interface ResetFormValues {
  token: string;
  newPassword: string;
  confirmPassword: string;
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
 * Login form component props for the specific LoginForm component
 */
export interface LoginFormComponentProps {
  onForgotPassword?: () => void;
  onSignUpPress?: () => void;
  onSuccess?: () => void;
  showSocialAuth?: boolean;
  enabledProviders?: AuthProvider[];
  style?: Record<string, unknown>;
}

/**
 * Sign up form component props for the specific SignUpForm component
 */
export interface SignUpFormComponentProps {
  onSignInPress?: () => void;
  onSuccess?: () => void;
  showSocialAuth?: boolean;
  enabledProviders?: AuthProvider[];
  termsUrl?: string;
  privacyUrl?: string;
  style?: Record<string, unknown>;
}

/**
 * Social auth buttons component props
 */
export interface SocialAuthButtonsProps {
  onSuccess?: (provider: string) => void;
  onError?: (provider: string, error: string) => void;
  onRequiresAdditionalInfo?: (provider: string, providerData: Record<string, unknown>) => void;
}

/**
 * Password reset form component props for the specific PasswordResetForm component
 */
export interface PasswordResetFormComponentProps {
  mode?: 'request' | 'reset';
  resetToken?: string;
  onBackToLogin?: () => void;
  onSuccess?: () => void;
  style?: Record<string, unknown>;
}

/**
 * Protected route component props for the specific ProtectedRoute component
 */
export interface ProtectedRouteComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
  showAuthorizationDetails?: boolean;
  onAuthorizationChange?: (isAuthorized: boolean, isAuthenticated: boolean) => void;
  // UseProtectedRouteOptions properties
  requireAuthentication?: boolean;
  requiredPermissions?: string[];
  requireAll?: boolean;
  autoRedirect?: boolean;
  unauthorizedRedirect?: string;
  unauthenticatedRedirect?: string;
}

/**
 * Conditional render props
 */
export interface ConditionalRenderProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  session?: unknown;
}

/**
 * Permission gate props
 */
export interface PermissionGateProps {
  children: React.ReactNode;
  permissions: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  inverse?: boolean; // Show when user DOESN'T have permissions
}

/**
 * Auth redirect component props for authentication-based redirects
 */
export interface AuthRedirectComponentProps {
  children?: React.ReactNode;
  defaultAuthenticatedRoute?: string;
  defaultUnauthenticatedRoute?: string;
  preserveReturnUrl?: boolean;
  loadingComponent?: React.ReactNode;
  onRedirect?: (from: string, to: string, reason: string) => void;
}

/**
 * Auth callback handler component props
 */
export interface AuthCallbackHandlerProps {
  onSuccess?: (destination: string) => void;
  onError?: (error: string) => void;
  defaultSuccessRoute?: string;
}

// ============================================================================
// AUTH NAVIGATION INTERFACES
// ============================================================================

/**
 * Auth navigation options
 */
export interface AuthNavigationOptions {
  preserveRoute?: boolean;
  clearHistory?: boolean;
  redirectPath?: string;
}

/**
 * Auth navigation hook return type
 */
export interface AuthNavigationHook {
  navigateToProtectedRoute: (route: string, options?: AuthNavigationOptions) => Promise<void>;
  navigateToAuth: (options?: AuthNavigationOptions) => Promise<void>;
  handleAuthSuccess: (options?: AuthNavigationOptions) => Promise<void>;
  navigateToSignUp: () => void;
  navigateToForgotPassword: () => void;
  navigateBack: () => void;
  getCurrentRoute: () => string | null;
  getPreviousRoute: () => Promise<string | null>;
  setPreviousRoute: (route: string) => Promise<void>;
}

/**
 * Protected route state
 */
export interface ProtectedRouteState {
  isAuthorized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: IUserSession | null;
  error: string | null;
  redirectTo: string | null;
  authorizationDetails: {
    hasValidSession: boolean;
    sessionExpired: boolean;
    hasRequiredPermissions: boolean;
    userPermissions: string[];
    requiredPermissions: string[];
    missingPermissions: string[];
  };
}

/**
 * Protected route actions
 */
export interface ProtectedRouteActions {
  redirectToLogin: (returnUrl?: string) => void;
  redirectToUnauthorized: () => void;
  checkAuthorization: (route?: string, permissions?: string[]) => Promise<boolean>;
  refreshAuthorization: () => Promise<void>;
  clearError: () => void;
}

/**
 * Protected route hook options
 */
export interface UseProtectedRouteOptions {
  route?: string;
  requiredPermissions?: string[];
  requireAuthentication?: boolean;
  autoRedirect?: boolean;
  onUnauthorized?: (reason: string) => void;
  onAuthenticationRequired?: () => void;
}

/**
 * Protected route hook return type
 */
export interface UseProtectedRouteHook extends ProtectedRouteState, ProtectedRouteActions {}

/**
 * Update profile data
 */
export interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
}

/**
 * User info interface
 */
export interface UserInfo {
  userName: string;
  email: string | null;
  userId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

// ============================================================================
// AUTH HOOK INTERFACES
// ============================================================================

/**
 * Auth forms hook return type
 */
export interface UseAuthFormsHook {
  // State
  loginState: AuthFormState;
  signUpState: AuthFormState;
  passwordResetState: AuthFormState;
  resetPasswordState: AuthFormState;

  // Actions
  handleLoginSubmit: (values: LoginFormValues) => Promise<void>;
  handleSignUpSubmit: (values: SignUpFormValues) => Promise<void>;
  handlePasswordResetRequest: (email: string) => Promise<void>;
  handlePasswordResetSubmit: (values: ResetFormValues) => Promise<void>;
  handleSocialAuth: (provider: AuthProvider) => Promise<void>;
  
  // Validation
  validateLoginForm: (values: Partial<LoginFormValues>) => Record<string, string>;
  validateSignUpForm: (values: Partial<SignUpFormValues>) => Record<string, string>;
  validatePasswordResetForm: (values: Partial<PasswordResetFormValues>) => Record<string, string>;
  validateResetForm: (values: Partial<ResetFormValues>) => Record<string, string>;

  // Utilities
  clearErrors: () => void;
  clearSuccess: () => void;
  getPasswordStrength: (password: string) => {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  };
}

/**
 * Auth Presentation Interfaces
 * 
 * All authentication-related interfaces for the presentation layer.
 */

import * as React from 'react';
import { BaseComponentProps, FormState, FormSubmissionResult } from './shared';

// ============================================================================
// AUTH CONTEXT INTERFACES
// ============================================================================

/**
 * Auth context type (extracted from AuthContext.tsx)
 */
export interface AuthContextType {
  session: any | null; // Using any to avoid external dependencies
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
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  accessToken: string | null;
  isExpired: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

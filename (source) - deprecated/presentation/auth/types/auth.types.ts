/**
 * Simplified Auth Types for Presentation Layer
 * Clean, simple interfaces focused on UI concerns
 */

import { UserSession } from '../../../business/interfaces/session';

// ============================================================================
// CORE AUTH STATE TYPES
// ============================================================================

/**
 * Simple auth context type - matches /src reference pattern
 */
export interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
}

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Simple auth state for presentation components
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: UserSession | null;
  error?: string;
}

// ============================================================================
// USER INFO TYPES
// ============================================================================

/**
 * User information for UI display
 */
export interface UserInfo {
  userName: string;
  email: string | null;
  userId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

// ============================================================================
// AUTH FORM TYPES
// ============================================================================

/**
 * Sign in form data
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Sign up form data
 */
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Password reset form data
 */
export interface PasswordResetFormData {
  email: string;
}

/**
 * Auth form result
 */
export interface AuthFormResult {
  success: boolean;
  error?: string;
  isNetworkError?: boolean;
}

// ============================================================================
// AUTH HOOK TYPES
// ============================================================================

/**
 * Simple auth state hook result
 */
export interface UseAuthStateResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: UserSession | null;
  error?: string;
  checkAuth: () => Promise<void>;
}

/**
 * Business auth hook result
 */
export interface UseBusinessAuthResult {
  signIn: (email: string, password: string) => Promise<AuthFormResult>;
  signUp: (email: string, password: string) => Promise<AuthFormResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthFormResult>;
  isLoading: boolean;
}

// ============================================================================
// ROUTE PROTECTION TYPES
// ============================================================================

/**
 * Auth guard props
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  publicRoutes?: string[];
}

/**
 * Simple protected route props
 */
export interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

// ============================================================================
// LOGOUT TYPES
// ============================================================================

/**
 * Logout hook result
 */
export interface UseLogoutResult {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

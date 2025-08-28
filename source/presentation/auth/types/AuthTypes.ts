/**
 * Presentation Layer Auth Types
 * 
 * Defines types and interfaces used in the presentation layer
 * for authentication and session management.
 * 
 * These types are abstracted from any specific authentication
 * provider and work with the business layer interfaces.
 */

import { IUserSession } from '../../../business/shared/interfaces/IUserSession';

/**
 * Auth context value interface for presentation layer
 * Uses only business layer session types
 */
export interface AuthContextValue {
  /**
   * Current user session (business layer interface)
   */
  userSession: IUserSession | null;

  /**
   * Loading state for auth operations
   */
  isLoading: boolean;

  /**
   * Current auth error message
   */
  error: string | null;

  /**
   * Whether session refresh is in progress
   */
  isRefreshing: boolean;

  /**
   * Refresh the current session
   * @returns Promise resolving to success status
   */
  refreshSession: () => Promise<boolean>;

  /**
   * Clear any current error
   */
  clearError: () => void;

  /**
   * Sign out the current user
   */
  signOut: () => Promise<void>;
}

/**
 * Bridge auth context value interface
 * For compatibility with existing implementations
 */
export interface BridgeAuthContextValue {
  /**
   * Current user session (business layer interface)
   */
  session: IUserSession | null;

  /**
   * Loading state for auth operations
   */
  isLoading: boolean;
}

/**
 * Auth form state interface
 */
export interface AuthFormState {
  /**
   * Whether form submission is in progress
   */
  isLoading: boolean;

  /**
   * Current form error message
   */
  error: string | null;

  /**
   * Success message for form operations
   */
  success: string | null;
}

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
 * Auth navigation options
 */
export interface AuthNavigationOptions {
  /**
   * Redirect path after successful authentication
   */
  redirectTo?: string;

  /**
   * Whether to replace current route in history
   */
  replace?: boolean;

  /**
   * Additional navigation parameters
   */
  params?: Record<string, string>;
}

/**
 * Session validation result for presentation layer
 */
export interface PresentationSessionValidation {
  /**
   * Whether the session is valid for UI purposes
   */
  isValid: boolean;

  /**
   * Whether the session needs refresh
   */
  needsRefresh: boolean;

  /**
   * Whether the session is expired
   */
  isExpired: boolean;

  /**
   * Time until session expires (in milliseconds)
   */
  timeToExpiry?: number;

  /**
   * Validation error message
   */
  error?: string;
}

/**
 * Auth provider configuration
 */
export interface AuthProviderConfig {
  /**
   * Whether to enable automatic session refresh
   */
  autoRefresh?: boolean;

  /**
   * Session refresh threshold (milliseconds before expiry)
   */
  refreshThreshold?: number;

  /**
   * Whether to enable session monitoring
   */
  enableMonitoring?: boolean;

  /**
   * Custom error handler for auth operations
   */
  onError?: (error: string) => void;

  /**
   * Custom success handler for auth operations
   */
  onSuccess?: (session: IUserSession) => void;
}

/**
 * Protected route configuration
 */
export interface ProtectedRouteConfig {
  /**
   * Required permissions for accessing the route
   */
  requiredPermissions?: string[];

  /**
   * Redirect path for unauthorized access
   */
  unauthorizedRedirect?: string;

  /**
   * Redirect path for unauthenticated access
   */
  unauthenticatedRedirect?: string;

  /**
   * Whether to show loading state during auth check
   */
  showLoading?: boolean;

  /**
   * Custom authorization check function
   */
  customAuthCheck?: (session: IUserSession) => boolean;
}

/**
 * Session monitoring configuration
 */
export interface SessionMonitorConfig {
  /**
   * Interval for checking session status (milliseconds)
   */
  checkInterval?: number;

  /**
   * Whether to monitor user activity
   */
  monitorActivity?: boolean;

  /**
   * Activity timeout (milliseconds)
   */
  activityTimeout?: number;

  /**
   * Events to monitor for user activity
   */
  activityEvents?: string[];
}

/**
 * Auth hook return type
 */
export interface UseAuthReturn {
  /**
   * Current user session
   */
  session: IUserSession | null;

  /**
   * Whether auth is loading
   */
  isLoading: boolean;

  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Current user ID
   */
  userId: string | null;

  /**
   * Current access token
   */
  accessToken: string | null;

  /**
   * Whether session is expired
   */
  isExpired: boolean;

  /**
   * Sign out function
   */
  signOut: () => Promise<void>;

  /**
   * Refresh session function
   */
  refreshSession: () => Promise<boolean>;
}

/**
 * Session hook return type
 */
export interface UseSessionReturn {
  /**
   * Current session
   */
  session: IUserSession | null;

  /**
   * Session validation status
   */
  validation: PresentationSessionValidation;

  /**
   * Whether session is being refreshed
   */
  isRefreshing: boolean;

  /**
   * Refresh session manually
   */
  refresh: () => Promise<boolean>;

  /**
   * Validate session manually
   */
  validate: () => Promise<PresentationSessionValidation>;
}

/**
 * Type guard to check if value is IUserSession
 */
export function isUserSession(value: unknown): value is IUserSession {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'accessToken' in value &&
    'expiresAt' in value &&
    'isValid' in value &&
    typeof (value as any).userId === 'string' &&
    typeof (value as any).accessToken === 'string' &&
    (value as any).expiresAt instanceof Date &&
    typeof (value as any).isValid === 'function'
  );
}

/**
 * Type for auth context provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
  config?: AuthProviderConfig;
}

/**
 * Type for bridge auth provider props
 */
export interface BridgeAuthProviderProps {
  children: React.ReactNode;
  existingSession: unknown; // External session (e.g., Supabase)
  existingIsLoading: boolean;
}

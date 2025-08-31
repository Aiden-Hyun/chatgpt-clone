/**
 * Session-related interfaces for presentation layer
 */


import { UserSession } from './auth';

// ============================================================================
// EXTERNAL SESSION TYPES - Types for external session formats
// ============================================================================

/**
 * Supabase session format
 */
export interface SupabaseSession {
  user?: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
  access_token?: string;
  expires_at?: number;
  [key: string]: unknown;
}

/**
 * Generic external session format
 */
export interface ExternalSession {
  userId?: string;
  accessToken?: string;
  expiresAt?: Date;
  [key: string]: unknown;
}

// ============================================================================
// SESSION VALIDATION TYPES - Types for session validation
// ============================================================================

/**
 * Session validation result
 */
export interface SessionValidationResult {
  isValid: boolean;
  isBusinessSession: boolean;
  isExpired: boolean;
  hasUserId: boolean;
  hasAccessToken: boolean;
  error?: string;
}

// ============================================================================
// SESSION MONITOR INTERFACES
// ============================================================================

/**
 * Session monitor props
 */
export interface SessionMonitorProps {
  session: UserSession | null;
  onSessionExpired?: () => void;
  onSessionExpiring?: (timeRemaining: number) => void;
  onSessionRefreshed?: (session: UserSession) => void;
  onSessionError?: (error: string) => void;
  enableAutoRefresh?: boolean;
  enableAutoLogout?: boolean;
  warningThresholdMinutes?: number;
  refreshThresholdMinutes?: number;
  children?: React.ReactNode;
}

/**
 * Session monitor state
 */
export interface SessionMonitorState {
  isMonitoring: boolean;
  lastCheck: Date | null;
  refreshAttempts: number;
  autoLogoutScheduled: boolean;
}

// ============================================================================
// SESSION HOOK INTERFACES
// ============================================================================

/**
 * Session state
 */
export interface SessionState {
  session: UserSession | null;
  isLoading: boolean;
  error: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  timeUntilExpiry: number;
  sessionHealth: 'healthy' | 'warning' | 'expired';
}

/**
 * Session actions
 */
export interface SessionActions {
  refreshSession: () => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  updateLastActivity: () => Promise<void>;
  getSessionDetails: () => Promise<SessionState['session']>;
}

/**
 * Use session hook
 */
export interface UseSessionHook extends SessionState, SessionActions {}

/**
 * Session Business Layer Interfaces and Types
 * All session management-related interfaces and types
 */

import { IUserSession } from './shared';

// ============================================================================
// SESSION ENTITIES - Session domain objects
// ============================================================================

/**
 * User session entity implementation
 */
export class UserSession implements IUserSession {
  public readonly refreshToken?: string;

  constructor(
    public readonly userId: string,
    public readonly accessToken: string,
    public readonly expiresAt: Date,
    public readonly userEmail?: string,
    public readonly createdAt: Date = new Date(),
    refreshToken?: string,
  ) {
    this.refreshToken = refreshToken;
  }

  withTokens(accessToken: string, refreshToken: string): UserSession {
    return new UserSession(
      this.userId,
      accessToken,
      this.expiresAt,
      this.userEmail,
      this.createdAt,
      refreshToken
    );
  }

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
// SESSION REPOSITORY INTERFACE - Session data access
// ============================================================================

/**
 * Session refresh result
 */
export interface RefreshResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

/**
 * Session save result
 */
export interface SaveSessionResult {
  success: boolean;
  error?: string;
}

/**
 * Session repository interface
 */
export interface ISessionRepository {
  /**
   * Save a user session
   */
  save(session: UserSession): Promise<SaveSessionResult>;
  
  /**
   * Get the current user session
   */
  get(): Promise<UserSession | null>;
  
  /**
   * Clear the current session
   */
  clear(): Promise<void>;
  
  /**
   * Refresh the current session
   */
  refresh(refreshToken?: string): Promise<RefreshResult>;
  
  /**
   * Update last activity timestamp
   */
  updateLastActivity(userId: string): Promise<void>;
  
  /**
   * Check if session is valid
   */
  isValid(session: UserSession): Promise<boolean>;
  
  /**
   * Get user ID from current session
   */
  getUserId(): Promise<string | null>;
  
  /**
   * Check if valid tokens exist
   */
  hasValidTokens(): Promise<boolean>;
  
  /**
   * Sync session with external provider (e.g., Supabase)
   */
  syncWithSupabase(): Promise<RefreshResult>;
}

// ============================================================================
// SESSION OPERATION RESULTS - Business operation results
// ============================================================================

/**
 * Session creation result
 */
export interface SessionCreationResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

/**
 * Session validation result (extends shared SessionValidationResult)
 */
export interface SessionOperationResult {
  success: boolean;
  session?: UserSession;
  error?: string;
  requiresReauth?: boolean;
}

/**
 * Session activity update result
 */
export interface ActivityUpdateResult {
  success: boolean;
  lastActivity?: Date;
  error?: string;
}

// ============================================================================
// SESSION MANAGEMENT TYPES - Session lifecycle management
// ============================================================================

/**
 * Session configuration
 */
export interface SessionConfig {
  /**
   * Session timeout in milliseconds
   */
  timeoutMs: number;
  
  /**
   * Auto-refresh threshold in milliseconds
   */
  refreshThresholdMs: number;
  
  /**
   * Maximum session duration in milliseconds
   */
  maxDurationMs: number;
  
  /**
   * Whether to track user activity
   */
  trackActivity: boolean;
  
  /**
   * Activity update interval in milliseconds
   */
  activityUpdateIntervalMs: number;
}

/**
 * Session monitoring options
 */
export interface SessionMonitoringOptions {
  /**
   * Whether to auto-refresh sessions
   */
  autoRefresh: boolean;
  
  /**
   * Whether to track user activity
   */
  trackActivity: boolean;
  
  /**
   * Whether to show expiry warnings
   */
  showExpiryWarnings: boolean;
  
  /**
   * Warning threshold in milliseconds
   */
  warningThresholdMs: number;
}

// ============================================================================
// SESSION EVENTS - Session lifecycle events
// ============================================================================

/**
 * Session event types (extends shared SessionEvent)
 */
export enum SessionOperationEvent {
  SESSION_SAVED = 'session_saved',
  SESSION_LOADED = 'session_loaded',
  SESSION_CLEARED = 'session_cleared',
  SESSION_SYNC_STARTED = 'session_sync_started',
  SESSION_SYNC_COMPLETED = 'session_sync_completed',
  SESSION_SYNC_FAILED = 'session_sync_failed',
  ACTIVITY_UPDATED = 'session_activity_updated'
}

/**
 * Session operation event data
 */
export interface SessionOperationEventData {
  sessionId?: string;
  userId?: string;
  operation: string;
  timestamp: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// SESSION HELPERS - Utility functions
// ============================================================================

/**
 * Create a new user session
 */
export function createUserSession(params: {
  userId: string;
  accessToken: string;
  expiresAt: Date;
  userEmail?: string;
  createdAt?: Date;
}): UserSession {
  return new UserSession(
    params.userId,
    params.accessToken,
    params.expiresAt,
    params.userEmail,
    params.createdAt
  );
}

/**
 * Check if session needs refresh
 */
export function sessionNeedsRefresh(
  session: UserSession, 
  thresholdMs: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  return session.expiresWithin(thresholdMs);
}

/**
 * Calculate session remaining time
 */
export function getSessionRemainingTime(session: UserSession): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const remainingMs = session.getTimeToExpiry();
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

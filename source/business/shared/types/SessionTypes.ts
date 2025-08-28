/**
 * Session-related types and enums for the business layer
 * 
 * These types provide a clean abstraction for session management
 * without coupling to specific authentication providers.
 */

/**
 * Session status enumeration
 * Represents the current state of a user session
 */
export enum SessionStatus {
  /**
   * Session is valid and active
   */
  ACTIVE = 'active',

  /**
   * Session has expired
   */
  EXPIRED = 'expired',

  /**
   * Session is invalid or malformed
   */
  INVALID = 'invalid',

  /**
   * Session is expiring soon (within warning threshold)
   */
  EXPIRING_SOON = 'expiring_soon',

  /**
   * Session has been revoked or logged out
   */
  REVOKED = 'revoked'
}

/**
 * Session expiration warning thresholds
 * Used to determine when to warn users about expiring sessions
 */
export const SESSION_EXPIRY_THRESHOLDS = {
  /**
   * Warn when session expires within 5 minutes
   */
  WARNING_MS: 5 * 60 * 1000,

  /**
   * Critical warning when session expires within 1 minute
   */
  CRITICAL_MS: 1 * 60 * 1000,

  /**
   * Grace period after expiration for cleanup
   */
  GRACE_PERIOD_MS: 30 * 1000
} as const;

/**
 * Session validation error types
 * Categorizes different types of session validation failures
 */
export enum SessionValidationError {
  /**
   * Session has expired
   */
  EXPIRED = 'session_expired',

  /**
   * Session format is invalid
   */
  INVALID_FORMAT = 'invalid_format',

  /**
   * Required session fields are missing
   */
  MISSING_FIELDS = 'missing_fields',

  /**
   * Session signature is invalid
   */
  INVALID_SIGNATURE = 'invalid_signature',

  /**
   * Session has been revoked
   */
  REVOKED = 'session_revoked',

  /**
   * Unknown validation error
   */
  UNKNOWN = 'unknown_error'
}

/**
 * Session metadata interface
 * Additional information about a session that may be useful for business logic
 */
export interface SessionMetadata {
  /**
   * IP address where session was created
   */
  readonly createdFromIp?: string;

  /**
   * User agent string from session creation
   */
  readonly userAgent?: string;

  /**
   * Last activity timestamp
   */
  readonly lastActivityAt?: Date;

  /**
   * Session refresh count
   */
  readonly refreshCount?: number;

  /**
   * Authentication method used
   */
  readonly authMethod?: 'email' | 'oauth' | 'magic_link' | 'phone';

  /**
   * Additional provider-specific metadata
   */
  readonly providerMetadata?: Record<string, unknown>;
}

/**
 * Session refresh result
 * Result of attempting to refresh an expiring session
 */
export interface SessionRefreshResult {
  /**
   * Whether the refresh was successful
   */
  success: boolean;

  /**
   * New session if refresh was successful
   */
  newSession?: unknown; // Will be mapped to IUserSession by persistence layer

  /**
   * Error message if refresh failed
   */
  error?: string;

  /**
   * Whether the user needs to re-authenticate
   */
  requiresReauth?: boolean;
}

/**
 * Session event types
 * Events that can occur during session lifecycle
 */
export enum SessionEvent {
  /**
   * Session was created
   */
  CREATED = 'session_created',

  /**
   * Session was refreshed
   */
  REFRESHED = 'session_refreshed',

  /**
   * Session expired
   */
  EXPIRED = 'session_expired',

  /**
   * Session was revoked/logged out
   */
  REVOKED = 'session_revoked',

  /**
   * Session validation failed
   */
  VALIDATION_FAILED = 'session_validation_failed',

  /**
   * Session is expiring soon
   */
  EXPIRING_SOON = 'session_expiring_soon'
}

/**
 * Type guard to check if a value is a valid SessionStatus
 */
export function isValidSessionStatus(value: unknown): value is SessionStatus {
  return typeof value === 'string' && Object.values(SessionStatus).includes(value as SessionStatus);
}

/**
 * Type guard to check if a value is a valid SessionValidationError
 */
export function isValidSessionValidationError(value: unknown): value is SessionValidationError {
  return typeof value === 'string' && Object.values(SessionValidationError).includes(value as SessionValidationError);
}

/**
 * Utility type for session-related operations that can fail
 */
export type SessionResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  errorType?: SessionValidationError;
};

/**
 * Helper function to create successful session result
 */
export function createSessionSuccess<T>(data: T): SessionResult<T> {
  return { success: true, data };
}

/**
 * Helper function to create failed session result
 */
export function createSessionFailure<T>(error: string, errorType?: SessionValidationError): SessionResult<T> {
  return { success: false, error, errorType };
}

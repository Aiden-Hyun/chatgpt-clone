/**
 * Shared Business Layer Interfaces and Types
 * Core types used across all business domains
 */

// ============================================================================
// RESULT PATTERN - Core error handling for business layer
// ============================================================================

/**
 * Represents a successful operation result
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * Represents a failed operation result
 */
export interface Failure {
  readonly success: false;
  readonly error: string;
  readonly code?: string;
}

/**
 * Union type for operation results
 */
export type Result<T> = Success<T> | Failure;

/**
 * Create a successful result
 */
export function createSuccess<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * Create a failed result
 */
export function createFailure(error: string, code?: string): Failure {
  return { success: false, error, code };
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is failure
 */
export function isFailure<T>(result: Result<T>): result is Failure {
  return result.success === false;
}

// ============================================================================
// USER SESSION - Core session abstraction
// ============================================================================

/**
 * Abstract user session interface for the business layer
 * 
 * This interface provides a clean abstraction over authentication sessions,
 * decoupling the business layer from specific authentication providers like Supabase.
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

// UserSession class implementation moved to session.ts

/**
 * Session status enumeration
 */
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  REFRESHING = 'refreshing'
}

/**
 * Session events for monitoring
 */
export enum SessionEvent {
  CREATED = 'session_created',
  REFRESHED = 'session_refreshed',
  EXPIRED = 'session_expired',
  INVALIDATED = 'session_invalidated',
  ACTIVITY_UPDATED = 'session_activity_updated'
}

/**
 * Session operation result
 */
export type SessionResult<T = void> = Result<T>;

/**
 * Session validation error types
 */
export enum SessionValidationError {
  EXPIRED = 'session_expired',
  INVALID_FORMAT = 'invalid_format',
  MISSING_TOKEN = 'missing_token',
  NETWORK_ERROR = 'network_error'
}

// ============================================================================
// SESSION CONSTANTS
// ============================================================================

/**
 * Session expiry thresholds in milliseconds
 */
export const SESSION_EXPIRY_THRESHOLDS = {
  WARNING: 5 * 60 * 1000,    // 5 minutes
  REFRESH: 10 * 60 * 1000,   // 10 minutes
  CRITICAL: 1 * 60 * 1000    // 1 minute
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a successful session result
 */
export function createSessionSuccess<T>(data: T): SessionResult<T> {
  return createSuccess(data);
}

/**
 * Create a failed session result
 */
export function createSessionFailure(error: string, code?: string): SessionResult<never> {
  return createFailure(error, code);
}

/**
 * Check if session status is valid
 */
export function isValidSessionStatus(status: string): status is SessionStatus {
  return Object.values(SessionStatus).includes(status as SessionStatus);
}

/**
 * Check if session validation error is valid
 */
export function isValidSessionValidationError(error: string): error is SessionValidationError {
  return Object.values(SessionValidationError).includes(error as SessionValidationError);
}

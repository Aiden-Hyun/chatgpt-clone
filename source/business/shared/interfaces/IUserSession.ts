/**
 * Abstract user session interface for the business layer
 * 
 * This interface provides a clean abstraction over authentication sessions,
 * decoupling the business layer from specific authentication providers like Supabase.
 * 
 * The business layer only needs to know:
 * - Who the user is (userId)
 * - How to authenticate API calls (accessToken)
 * - When the session expires (expiresAt)
 * - Basic session validation
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
 * Factory interface for creating user sessions
 * Used by the persistence layer to create session instances
 */
export interface IUserSessionFactory {
  /**
   * Create a user session from raw session data
   * 
   * @param sessionData - Raw session data from authentication provider
   * @returns IUserSession instance or null if invalid
   */
  createSession(sessionData: unknown): IUserSession | null;

  /**
   * Create a session from individual components
   * 
   * @param params - Session parameters
   * @returns IUserSession instance
   */
  createSessionFromParams(params: {
    userId: string;
    accessToken: string;
    expiresAt: Date;
    userEmail?: string;
    createdAt?: Date;
  }): IUserSession;
}

/**
 * Session validation result
 * Used for session validation operations
 */
export interface SessionValidationResult {
  /**
   * Whether the session is valid
   */
  isValid: boolean;

  /**
   * Validation error message if invalid
   */
  error?: string;

  /**
   * Whether the session is expired specifically
   */
  isExpired?: boolean;

  /**
   * Whether the session format is invalid
   */
  isInvalidFormat?: boolean;
}

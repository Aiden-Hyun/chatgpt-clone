/**
 * Session-related interfaces for presentation layer
 */

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

/**
 * Union type for all possible session formats
 */
export type SessionLike = SupabaseSession | ExternalSession | Record<string, unknown>;

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

/**
 * Session extraction result
 */
export interface SessionExtractionResult {
  userId: string | null;
  accessToken: string | null;
  isExpired: boolean;
}

// ============================================================================
// SESSION CONVERTER TYPES - Types for session conversion utilities
// ============================================================================

/**
 * Session type guard function
 */
export type SessionTypeGuard<T> = (session: unknown) => session is T;

/**
 * Session property extractor function
 */
export type SessionPropertyExtractor<T> = (session: unknown) => T | null;

/**
 * Session converter options
 */
export interface SessionConverterOptions {
  strictMode?: boolean;
  allowPartial?: boolean;
  defaultExpiryMs?: number;
}

/**
 * Session Service Layer Interfaces
 * 
 * This file contains session-related interfaces used throughout the service layer.
 */

// ============================================================================
// SESSION TIME DATA INTERFACES
// ============================================================================

/**
 * Session time data interface for expiry calculations
 */
export interface SessionTimeData {
  expiresAt: Date;
  lastActivity: Date;
}

/**
 * Result of expiry time calculation
 */
export interface ExpiryCalculationResult {
  expiryDate: Date;
  durationMs: number;
  isValid: boolean;
}

/**
 * Result of time until expiry calculation
 */
export interface TimeUntilExpiryResult {
  timeRemaining: number; // milliseconds
  isExpired: boolean;
  isExpiringSoon: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
}

/**
 * Refresh recommendation for sessions
 */
export interface RefreshRecommendation {
  shouldRefresh: boolean;
  reason: string;
  timeUntilExpiry: number;
  thresholdUsed: number;
}

// ============================================================================
// SESSION DATA INTERFACES
// ============================================================================

/**
 * Session data interface for validation
 */
export interface SessionData {
  userId: string;
  isAuthenticated: boolean;
  permissions: string[];
  lastActivity: Date;
  expiresAt: Date;
}

// ============================================================================
// CONFIG SERVICE INTERFACES
// ============================================================================

/**
 * Config service interface for dependency injection
 */
export interface IConfigService {
  getSupabaseUrl(): string;
  getSupabaseAnonKey(): string;
  getEdgeFunctionBaseUrl(): string;
}

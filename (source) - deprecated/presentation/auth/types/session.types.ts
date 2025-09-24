/**
 * Simplified Session Types for Presentation Layer
 * Focus on UI-specific session concerns
 */

import { UserSession } from '../../../business/interfaces/session';

// ============================================================================
// SIMPLE SESSION TYPES
// ============================================================================

/**
 * Simple session state for presentation components
 */
export interface SimpleSessionState {
  session: UserSession | null;
  isLoading: boolean;
  error?: string;
}

/**
 * Simple session hook result
 */
export interface UseSimpleSessionResult {
  session: UserSession | null;
  isLoading: boolean;
  error?: string;
  loadSession: () => Promise<void>;
  clearSession: () => void;
  hasValidSession: boolean;
}

/**
 * Session display info for UI components
 */
export interface SessionDisplayInfo {
  userId: string | null;
  userEmail: string | null;
  isExpired: boolean;
  expiresAt: Date | null;
}

// ============================================================================
// SESSION UTILITIES
// ============================================================================

/**
 * Extract display information from session
 */
export function getSessionDisplayInfo(session: UserSession | null): SessionDisplayInfo {
  if (!session) {
    return {
      userId: null,
      userEmail: null,
      isExpired: true,
      expiresAt: null
    };
  }

  return {
    userId: session.userId,
    userEmail: session.userEmail || null,
    isExpired: session.isExpired(),
    expiresAt: session.expiresAt
  };
}

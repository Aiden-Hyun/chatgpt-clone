/**
 * Session Converter Utilities
 * 
 * Provides utilities for converting between different session types
 * and handling session-related operations in the presentation layer.
 * 
 * This utility ensures the presentation layer can work with business
 * session types while maintaining compatibility during migration.
 */

import { IUserSession } from '../../../business/shared/interfaces/IUserSession';
import { SessionAdapter } from '../../../persistence/shared/adapters/SessionAdapter';
import { Logger } from '../../../service/shared/utils/Logger';

/**
 * Session converter for presentation layer
 * Handles conversion between external session formats and business sessions
 */
export class SessionConverter {
  private static readonly logger = new Logger().child('SessionConverter');
  private static sessionAdapter = new SessionAdapter();

  /**
   * Convert any external session to business session
   * 
   * @param externalSession - Session from external source (e.g., Supabase)
   * @returns IUserSession or null if conversion fails
   */
  static toBusinessSession(externalSession: unknown): IUserSession | null {
    try {
      if (!externalSession) {
        return null;
      }

      const businessSession = this.sessionAdapter.createSession(externalSession);
      
      if (!businessSession) {
        this.logger.warn('Failed to convert external session to business session', {
          hasSession: !!externalSession,
          sessionType: typeof externalSession
        });
        return null;
      }

      this.logger.debug('Successfully converted external session to business session', {
        userId: businessSession.userId,
        isValid: businessSession.isValid()
      });

      return businessSession;

    } catch (error) {
      this.logger.error('Error converting external session to business session', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Validate that a session is a valid business session
   * 
   * @param session - Session to validate
   * @returns true if session is valid IUserSession
   */
  static isValidBusinessSession(session: unknown): session is IUserSession {
    return (
      typeof session === 'object' &&
      session !== null &&
      'userId' in session &&
      'accessToken' in session &&
      'expiresAt' in session &&
      'isValid' in session &&
      typeof (session as any).userId === 'string' &&
      typeof (session as any).accessToken === 'string' &&
      (session as any).expiresAt instanceof Date &&
      typeof (session as any).isValid === 'function'
    );
  }

  /**
   * Extract user ID from any session type
   * 
   * @param session - Session to extract user ID from
   * @returns User ID or null if not found
   */
  static extractUserId(session: unknown): string | null {
    try {
      if (this.isValidBusinessSession(session)) {
        return session.userId;
      }

      // Try to extract from external session formats
      if (typeof session === 'object' && session !== null) {
        // Supabase session format
        if ('user' in session && typeof (session as any).user === 'object') {
          const user = (session as any).user;
          if ('id' in user && typeof user.id === 'string') {
            return user.id;
          }
        }

        // Direct user ID
        if ('userId' in session && typeof (session as any).userId === 'string') {
          return (session as any).userId;
        }
      }

      return null;

    } catch (error) {
      this.logger.error('Error extracting user ID from session', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Extract access token from any session type
   * 
   * @param session - Session to extract access token from
   * @returns Access token or null if not found
   */
  static extractAccessToken(session: unknown): string | null {
    try {
      if (this.isValidBusinessSession(session)) {
        return session.accessToken;
      }

      // Try to extract from external session formats
      if (typeof session === 'object' && session !== null) {
        // Supabase session format
        if ('access_token' in session && typeof (session as any).access_token === 'string') {
          return (session as any).access_token;
        }

        // Business session format
        if ('accessToken' in session && typeof (session as any).accessToken === 'string') {
          return (session as any).accessToken;
        }
      }

      return null;

    } catch (error) {
      this.logger.error('Error extracting access token from session', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Check if a session is expired
   * 
   * @param session - Session to check
   * @returns true if session is expired
   */
  static isSessionExpired(session: unknown): boolean {
    try {
      if (this.isValidBusinessSession(session)) {
        return session.isExpired();
      }

      // Try to check expiry from external session formats
      if (typeof session === 'object' && session !== null) {
        // Supabase session format
        if ('expires_at' in session && typeof (session as any).expires_at === 'number') {
          const expiresAt = new Date((session as any).expires_at * 1000);
          return new Date() >= expiresAt;
        }

        // Business session format
        if ('expiresAt' in session && (session as any).expiresAt instanceof Date) {
          return new Date() >= (session as any).expiresAt;
        }
      }

      // If we can't determine expiry, assume it's expired for safety
      return true;

    } catch (error) {
      this.logger.error('Error checking session expiry', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // If we can't determine expiry, assume it's expired for safety
      return true;
    }
  }

  /**
   * Create a mock business session for testing
   * 
   * @param overrides - Optional overrides for session properties
   * @returns Mock IUserSession
   */
  static createMockSession(overrides: Partial<{
    userId: string;
    accessToken: string;
    expiresAt: Date;
    userEmail: string;
    createdAt: Date;
  }> = {}): IUserSession {
    const mockSession = this.sessionAdapter.createSessionFromParams({
      userId: overrides.userId || 'mock-user-id',
      accessToken: overrides.accessToken || 'mock-access-token',
      expiresAt: overrides.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      userEmail: overrides.userEmail || 'test@example.com',
      createdAt: overrides.createdAt || new Date()
    });

    return mockSession;
  }

  /**
   * Validate session and get validation details
   * 
   * @param session - Session to validate
   * @returns Validation result with details
   */
  static validateSession(session: unknown): {
    isValid: boolean;
    isBusinessSession: boolean;
    isExpired: boolean;
    hasUserId: boolean;
    hasAccessToken: boolean;
    error?: string;
  } {
    try {
      const isBusinessSession = this.isValidBusinessSession(session);
      const hasUserId = !!this.extractUserId(session);
      const hasAccessToken = !!this.extractAccessToken(session);
      const isExpired = this.isSessionExpired(session);

      const isValid = isBusinessSession && hasUserId && hasAccessToken && !isExpired;

      let error: string | undefined;
      if (!hasUserId) {
        error = 'Session missing user ID';
      } else if (!hasAccessToken) {
        error = 'Session missing access token';
      } else if (isExpired) {
        error = 'Session is expired';
      } else if (!isBusinessSession) {
        error = 'Session is not in business format';
      }

      return {
        isValid,
        isBusinessSession,
        isExpired,
        hasUserId,
        hasAccessToken,
        error
      };

    } catch (error) {
      return {
        isValid: false,
        isBusinessSession: false,
        isExpired: true,
        hasUserId: false,
        hasAccessToken: false,
        error: error instanceof Error ? error.message : 'Validation error'
      };
    }
  }
}


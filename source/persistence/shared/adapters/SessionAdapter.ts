import { Session } from '@supabase/supabase-js';
import { SupabaseSession } from '../../interfaces/auth';
import {
    createSessionFailure,
    createSessionSuccess,
    SessionValidationError,
    type SessionResult
} from '../../interfaces/shared';
import { Logger } from '../../../service/shared/utils/Logger';
import { IUserSession, IUserSessionFactory } from '../../interfaces/shared';
import { SessionMapper } from '../mappers/SessionMapper';

/**
 * Session adapter that provides IUserSession objects to the business layer
 * 
 * This adapter encapsulates all Supabase session operations and provides
 * a clean interface for session management without exposing Supabase details
 * to the business layer.
 */
export class SessionAdapter implements IUserSessionFactory {
  private static readonly logger = new Logger().child('SessionAdapter');

  /**
   * Create a user session from raw session data (typically from Supabase)
   * 
   * @param sessionData - Raw session data from authentication provider
   * @returns IUserSession instance or null if invalid
   */
  createSession(sessionData: unknown): IUserSession | null {
    try {
      // Type guard to check if sessionData is a Supabase Session
      if (!this.isSupabaseSession(sessionData)) {
        SessionAdapter.logger.warn('Invalid session data provided to createSession', {
          hasData: !!sessionData,
          dataType: typeof sessionData
        });
        return null;
      }

      return SessionMapper.toBusinessSession(sessionData);

    } catch (error) {
      SessionAdapter.logger.error('Error creating session from raw data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

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
  }): IUserSession {
    const result = SessionMapper.createBusinessSession(params);
    
    if (!result.success) {
      throw new Error(`Failed to create session: ${result.error}`);
    }
    
    return result.data;
  }

  /**
   * Validate a session and return detailed validation result
   * 
   * @param session - Session to validate (can be Supabase Session or IUserSession)
   * @returns Validation result with details
   */
  validateSession(session: unknown): SessionResult<IUserSession> {
    try {
      // Handle IUserSession validation
      if (this.isBusinessSession(session)) {
        if (session.isValid()) {
          return createSessionSuccess(session);
        } else {
          const errorType = session.isExpired() 
            ? SessionValidationError.EXPIRED 
            : SessionValidationError.INVALID_FORMAT;
          
          return createSessionFailure(
            session.isExpired() ? 'Session has expired' : 'Session is invalid',
            errorType
          );
        }
      }

      // Handle Supabase Session validation
      if (this.isSupabaseSession(session)) {
        const validation = SessionMapper.validateSupabaseSession(session);
        
        if (!validation.isValid) {
          let errorType = SessionValidationError.UNKNOWN;
          
          if (validation.isExpired) {
            errorType = SessionValidationError.EXPIRED;
          } else if (validation.isInvalidFormat) {
            errorType = SessionValidationError.INVALID_FORMAT;
          }
          
          return createSessionFailure(validation.error || 'Session validation failed', errorType);
        }

        // Convert to business session if valid
        const businessSession = SessionMapper.toBusinessSession(session);
        if (!businessSession) {
          return createSessionFailure('Failed to convert session', SessionValidationError.INVALID_FORMAT);
        }

        return createSessionSuccess(businessSession);
      }

      // Unknown session type
      return createSessionFailure('Unknown session type', SessionValidationError.INVALID_FORMAT);

    } catch (error) {
      SessionAdapter.logger.error('Error validating session', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return createSessionFailure(
        'Session validation failed due to internal error',
        SessionValidationError.UNKNOWN
      );
    }
  }

  /**
   * Get session status without full validation
   * 
   * @param session - Session to check status for
   * @returns Session status
   */
  getSessionStatus(session: unknown): SessionStatus {
    try {
      if (this.isBusinessSession(session)) {
        if (session.isExpired()) {
          return SessionStatus.EXPIRED;
        }
        if (!session.isValid()) {
          return SessionStatus.INVALID;
        }
        if (session.expiresWithin(5 * 60 * 1000)) { // 5 minutes
          return SessionStatus.EXPIRING_SOON;
        }
        return SessionStatus.ACTIVE;
      }

      if (this.isSupabaseSession(session)) {
        return SessionMapper.getSessionStatus(session);
      }

      return SessionStatus.INVALID;

    } catch (error) {
      SessionAdapter.logger.error('Error getting session status', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return SessionStatus.INVALID;
    }
  }

  /**
   * Convert a business session back to Supabase session format
   * Note: This is primarily for internal persistence operations
   * 
   * @param businessSession - Business session to convert
   * @returns Partial Supabase session data
   */
  toSupabaseFormat(businessSession: IUserSession): Partial<Session> {
    return SessionMapper.toSupabaseSessionData(businessSession);
  }

  /**
   * Extract user ID from any session type
   * 
   * @param session - Session to extract user ID from
   * @returns User ID or null if not found
   */
  extractUserId(session: unknown): string | null {
    try {
      if (this.isBusinessSession(session)) {
        return session.userId;
      }

      if (this.isSupabaseSession(session)) {
        return session.user?.id || null;
      }

      return null;

    } catch (error) {
      SessionAdapter.logger.error('Error extracting user ID from session', {
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
  extractAccessToken(session: unknown): string | null {
    try {
      if (this.isBusinessSession(session)) {
        return session.accessToken;
      }

      if (this.isSupabaseSession(session)) {
        return session.access_token || null;
      }

      return null;

    } catch (error) {
      SessionAdapter.logger.error('Error extracting access token from session', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Type guard to check if an object is a Supabase Session
   */
  private isSupabaseSession(obj: unknown): obj is SupabaseSession {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'access_token' in obj &&
      'user' in obj &&
      typeof (obj as SupabaseSession).access_token === 'string' &&
      typeof (obj as SupabaseSession).user === 'object' &&
      (obj as SupabaseSession).user !== null &&
      'id' in (obj as SupabaseSession).user
    );
  }

  /**
   * Type guard to check if an object is an IUserSession
   */
  private isBusinessSession(obj: unknown): obj is IUserSession {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'userId' in obj &&
      'accessToken' in obj &&
      'expiresAt' in obj &&
      'isValid' in obj &&
      typeof (obj as IUserSession).userId === 'string' &&
      typeof (obj as IUserSession).accessToken === 'string' &&
      (obj as IUserSession).expiresAt instanceof Date &&
      typeof (obj as IUserSession).isValid === 'function'
    );
  }
}

import { Session } from '@supabase/supabase-js';
import { IUserSession, SessionValidationResult } from '../../../business/shared/interfaces/IUserSession';
import {
    SESSION_EXPIRY_THRESHOLDS,
    SessionStatus,
    SessionValidationError,
    createSessionFailure,
    createSessionSuccess,
    type SessionResult
} from '../../../business/types/session/SessionTypes';
import { Logger } from '../../../service/shared/utils/Logger';

/**
 * Concrete implementation of IUserSession
 * Wraps Supabase session data with business layer interface
 */
class UserSession implements IUserSession {
  constructor(
    public readonly userId: string,
    public readonly accessToken: string,
    public readonly expiresAt: Date,
    public readonly userEmail?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  isValid(): boolean {
    return !this.isExpired() && 
           this.userId.length > 0 && 
           this.accessToken.length > 0;
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

/**
 * Maps between Supabase Session objects and business layer IUserSession interface
 * 
 * This mapper encapsulates all Supabase-specific session logic and provides
 * a clean abstraction for the business layer.
 */
export class SessionMapper {
  private static readonly logger = new Logger().child('SessionMapper');

  /**
   * Convert Supabase Session to business layer IUserSession
   * 
   * @param supabaseSession - Supabase session object
   * @returns IUserSession instance or null if conversion fails
   */
  static toBusinessSession(supabaseSession: Session | null): IUserSession | null {
    if (!supabaseSession) {
      this.logger.debug('Cannot convert null/undefined session');
      return null;
    }

    try {
      // Validate required Supabase session fields
      if (!supabaseSession.user?.id) {
        this.logger.warn('Supabase session missing user ID');
        return null;
      }

      if (!supabaseSession.access_token) {
        this.logger.warn('Supabase session missing access token');
        return null;
      }

      if (!supabaseSession.expires_at) {
        this.logger.warn('Supabase session missing expiration timestamp');
        return null;
      }

      // Convert expiration timestamp (Unix timestamp in seconds to Date)
      const expiresAt = new Date(supabaseSession.expires_at * 1000);
      
      // Validate expiration date
      if (isNaN(expiresAt.getTime())) {
        this.logger.warn('Invalid expiration timestamp in Supabase session', {
          expires_at: supabaseSession.expires_at
        });
        return null;
      }

      // Extract user email if available
      const userEmail = supabaseSession.user.email || undefined;

      // Create business session
      const businessSession = new UserSession(
        supabaseSession.user.id,
        supabaseSession.access_token,
        expiresAt,
        userEmail,
        new Date() // createdAt - we don't have this from Supabase, so use current time
      );

      this.logger.debug('Successfully converted Supabase session to business session', {
        userId: businessSession.userId,
        hasEmail: !!businessSession.userEmail,
        expiresAt: businessSession.expiresAt.toISOString(),
        isValid: businessSession.isValid()
      });

      return businessSession;

    } catch (error) {
      this.logger.error('Error converting Supabase session to business session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionExists: !!supabaseSession
      });
      return null;
    }
  }

  /**
   * Validate a Supabase session and return detailed validation result
   * 
   * @param supabaseSession - Supabase session to validate
   * @returns Detailed validation result
   */
  static validateSupabaseSession(supabaseSession: Session | null): SessionValidationResult {
    if (!supabaseSession) {
      return {
        isValid: false,
        error: 'Session is null or undefined',
        isInvalidFormat: true
      };
    }

    // Check required fields
    if (!supabaseSession.user?.id) {
      return {
        isValid: false,
        error: 'Session missing user ID',
        isInvalidFormat: true
      };
    }

    if (!supabaseSession.access_token) {
      return {
        isValid: false,
        error: 'Session missing access token',
        isInvalidFormat: true
      };
    }

    if (!supabaseSession.expires_at) {
      return {
        isValid: false,
        error: 'Session missing expiration timestamp',
        isInvalidFormat: true
      };
    }

    // Check expiration
    const expiresAt = new Date(supabaseSession.expires_at * 1000);
    if (isNaN(expiresAt.getTime())) {
      return {
        isValid: false,
        error: 'Invalid expiration timestamp',
        isInvalidFormat: true
      };
    }

    const now = new Date();
    if (now >= expiresAt) {
      return {
        isValid: false,
        error: 'Session has expired',
        isExpired: true
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Get session status from Supabase session
   * 
   * @param supabaseSession - Supabase session to check
   * @returns Session status
   */
  static getSessionStatus(supabaseSession: Session | null): SessionStatus {
    const validation = this.validateSupabaseSession(supabaseSession);
    
    if (!validation.isValid) {
      if (validation.isExpired) {
        return SessionStatus.EXPIRED;
      }
      if (validation.isInvalidFormat) {
        return SessionStatus.INVALID;
      }
      return SessionStatus.INVALID;
    }

    // Check if expiring soon
    if (supabaseSession) {
      const expiresAt = new Date(supabaseSession.expires_at! * 1000);
      const timeToExpiry = expiresAt.getTime() - new Date().getTime();
      
      if (timeToExpiry <= SESSION_EXPIRY_THRESHOLDS.WARNING_MS) {
        return SessionStatus.EXPIRING_SOON;
      }
    }

    return SessionStatus.ACTIVE;
  }

  /**
   * Convert business session back to Supabase session format
   * Note: This is a lossy conversion as we don't store all Supabase fields
   * 
   * @param businessSession - Business session to convert
   * @returns Partial Supabase session data
   */
  static toSupabaseSessionData(businessSession: IUserSession): Partial<Session> {
    return {
      access_token: businessSession.accessToken,
      expires_at: Math.floor(businessSession.expiresAt.getTime() / 1000),
      user: {
        id: businessSession.userId,
        email: businessSession.userEmail,
        // Note: Other user fields would need to be preserved separately
        // if they're needed for Supabase operations
        aud: 'authenticated',
        role: 'authenticated',
        created_at: businessSession.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {}
      }
    };
  }

  /**
   * Create a business session from individual parameters
   * Useful for testing or when creating sessions from other sources
   * 
   * @param params - Session parameters
   * @returns Business session instance
   */
  static createBusinessSession(params: {
    userId: string;
    accessToken: string;
    expiresAt: Date;
    userEmail?: string;
    createdAt?: Date;
  }): SessionResult<IUserSession> {
    try {
      // Validate parameters
      if (!params.userId || params.userId.trim().length === 0) {
        return createSessionFailure('User ID is required', SessionValidationError.MISSING_FIELDS);
      }

      if (!params.accessToken || params.accessToken.trim().length === 0) {
        return createSessionFailure('Access token is required', SessionValidationError.MISSING_FIELDS);
      }

      if (!params.expiresAt || isNaN(params.expiresAt.getTime())) {
        return createSessionFailure('Valid expiration date is required', SessionValidationError.INVALID_FORMAT);
      }

      if (params.expiresAt <= new Date()) {
        return createSessionFailure('Session expiration must be in the future', SessionValidationError.EXPIRED);
      }

      const session = new UserSession(
        params.userId.trim(),
        params.accessToken.trim(),
        params.expiresAt,
        params.userEmail?.trim(),
        params.createdAt || new Date()
      );

      return createSessionSuccess(session);

    } catch (error) {
      this.logger.error('Error creating business session from parameters', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params: {
          userId: params.userId,
          hasAccessToken: !!params.accessToken,
          expiresAt: params.expiresAt?.toISOString(),
          hasEmail: !!params.userEmail
        }
      });

      return createSessionFailure(
        'Failed to create session from parameters',
        SessionValidationError.UNKNOWN
      );
    }
  }
}

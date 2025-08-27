import { TokenValidator } from '../../../service/auth/validators/TokenValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { IUserRepository } from '../../auth/interfaces/IUserRepository';
import { UserSession } from '../entities/UserSession';
import { ISessionRepository } from '../interfaces/ISessionRepository';

export interface GetSessionRequest {
  validateExpiry?: boolean;
  refreshIfExpired?: boolean;
}

export interface GetSessionResult {
  success: boolean;
  session?: UserSession;
  error?: string;
  isExpired?: boolean;
  wasRefreshed?: boolean;
}

export class GetSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(request: GetSessionRequest = {}): Promise<GetSessionResult> {
    try {
      Logger.info('GetSessionUseCase: Retrieving current session', { 
        validateExpiry: request.validateExpiry,
        refreshIfExpired: request.refreshIfExpired 
      });

      // Get session from repository
      const session = await this.sessionRepository.get();
      
      if (!session) {
        Logger.info('GetSessionUseCase: No session found');
        return { 
          success: false, 
          error: 'No session found' 
        };
      }

      // Validate session expiry if requested
      if (request.validateExpiry !== false) {
        const isExpired = this.isSessionExpired(session);
        
        if (isExpired) {
          Logger.warn('GetSessionUseCase: Session is expired', { 
            userId: session.userId,
            expiresAt: session.expiresAt 
          });

          // Attempt to refresh if requested and refresh token is available
          if (request.refreshIfExpired && session.refreshToken) {
            Logger.info('GetSessionUseCase: Attempting to refresh expired session');
            
            const refreshResult = await this.refreshExpiredSession(session);
            if (refreshResult.success && refreshResult.session) {
              Logger.info('GetSessionUseCase: Session refreshed successfully');
              return {
                success: true,
                session: refreshResult.session,
                wasRefreshed: true
              };
            } else {
              Logger.warn('GetSessionUseCase: Failed to refresh expired session', { 
                error: refreshResult.error 
              });
              return {
                success: false,
                session,
                error: 'Session expired and refresh failed',
                isExpired: true
              };
            }
          }

          return {
            success: false,
            session,
            error: 'Session has expired',
            isExpired: true
          };
        }
      }

      // Session is valid
      Logger.info('GetSessionUseCase: Valid session retrieved', { 
        userId: session.userId,
        expiresAt: session.expiresAt 
      });

      return {
        success: true,
        session
      };

    } catch (error) {
      Logger.error('GetSessionUseCase: Failed to get session', { error });
      return {
        success: false,
        error: 'Failed to retrieve session'
      };
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: UserSession): boolean {
    try {
      // Check if session has expired based on expiry date
      const now = new Date();
      if (session.expiresAt <= now) {
        return true;
      }

      // If we have an access token, validate it as well
      if (session.accessToken) {
        return TokenValidator.isTokenExpired(session.accessToken);
      }

      return false;
    } catch (error) {
      Logger.warn('GetSessionUseCase: Error checking session expiry, treating as expired', { 
        error,
        userId: session.userId 
      });
      return true;
    }
  }

  /**
   * Attempt to refresh an expired session
   */
  private async refreshExpiredSession(session: UserSession): Promise<{
    success: boolean;
    session?: UserSession;
    error?: string;
  }> {
    try {
      if (!session.refreshToken) {
        return {
          success: false,
          error: 'No refresh token available'
        };
      }

      // Use the user repository to refresh the token
      const refreshResult = await this.userRepository.refreshToken(session.refreshToken);
      
      if (!refreshResult.success || !refreshResult.session) {
        return {
          success: false,
          error: refreshResult.error || 'Token refresh failed'
        };
      }

      // Create new UserSession with updated tokens
      const refreshedSession = new UserSession(
        session.userId,
        true,
        session.permissions,
        session.createdAt,
        new Date(refreshResult.session.expires_at! * 1000),
        refreshResult.session.refresh_token || session.refreshToken,
        refreshResult.accessToken || refreshResult.session.access_token
      );

      // Save the refreshed session
      const saveResult = await this.sessionRepository.save(refreshedSession);
      if (!saveResult.success) {
        Logger.error('GetSessionUseCase: Failed to save refreshed session', { 
          error: saveResult.error 
        });
        return {
          success: false,
          error: 'Failed to save refreshed session'
        };
      }

      return {
        success: true,
        session: refreshedSession
      };

    } catch (error) {
      Logger.error('GetSessionUseCase: Error refreshing session', { error });
      return {
        success: false,
        error: 'Session refresh failed'
      };
    }
  }

  /**
   * Get session without validation (for internal use)
   */
  async getRawSession(): Promise<UserSession | null> {
    try {
      return await this.sessionRepository.get();
    } catch (error) {
      Logger.error('GetSessionUseCase: Failed to get raw session', { error });
      return null;
    }
  }

  /**
   * Check if a valid session exists without retrieving it
   */
  async hasValidSession(): Promise<boolean> {
    try {
      const result = await this.execute({ validateExpiry: true });
      return result.success && !result.isExpired;
    } catch (error) {
      Logger.error('GetSessionUseCase: Error checking session validity', { error });
      return false;
    }
  }
}
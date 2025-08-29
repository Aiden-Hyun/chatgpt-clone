import { TokenValidator } from '../../../service/auth/validators/TokenValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { RefreshTokenUseCase } from '../../auth/use-cases/RefreshTokenUseCase';
import { UserSession } from '../../interfaces';
import { ISessionRepository } from '../../interfaces';



export class ValidateSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  async execute(request: ValidateSessionRequest = {}): Promise<SessionValidationResult> {
    try {
      Logger.info('ValidateSessionUseCase: Starting session validation', { 
        autoRefresh: request.autoRefresh,
        forceRefresh: request.forceRefresh 
      });

      // Initialize validation details
      const validationDetails = {
        exists: false,
        isActive: false,
        isExpired: false,
        needsRefresh: false,
        wasRefreshed: false,
        timeUntilExpiry: undefined as number | undefined
      };

      // Get current session
      const session = await this.sessionRepository.get();
      
      if (!session) {
        Logger.info('ValidateSessionUseCase: No session exists');
        return {
          success: true,
          isValid: false,
          error: 'No session found',
          validationDetails
        };
      }

      validationDetails.exists = true;
      validationDetails.isActive = session.isActive;

      // Check if session is active
      if (!session.isActive) {
        Logger.warn('ValidateSessionUseCase: Session is inactive', { userId: session.userId });
        return {
          success: true,
          isValid: false,
          session,
          error: 'Session is inactive',
          validationDetails
        };
      }

      // Validate session expiry
      const expiryValidation = this.validateExpiry(session);
      validationDetails.isExpired = expiryValidation.isExpired;
      validationDetails.needsRefresh = expiryValidation.needsRefresh;
      validationDetails.timeUntilExpiry = expiryValidation.timeUntilExpiry;

      // Handle expired session
      if (expiryValidation.isExpired) {
        Logger.warn('ValidateSessionUseCase: Session is expired', { 
          userId: session.userId,
          expiresAt: session.expiresAt 
        });

        if (request.autoRefresh && session.refreshToken) {
          const refreshResult = await this.attemptRefresh(session);
          if (refreshResult.success && refreshResult.session) {
            validationDetails.wasRefreshed = true;
            Logger.info('ValidateSessionUseCase: Session refreshed successfully');
            
            return {
              success: true,
              isValid: true,
              session: refreshResult.session,
              validationDetails
            };
          } else {
            Logger.warn('ValidateSessionUseCase: Session refresh failed', { 
              error: refreshResult.error 
            });
            return {
              success: true,
              isValid: false,
              session,
              error: 'Session expired and refresh failed',
              validationDetails
            };
          }
        }

        return {
          success: true,
          isValid: false,
          session,
          error: 'Session has expired',
          validationDetails
        };
      }

      // Handle refresh needed (but not expired)
      if (expiryValidation.needsRefresh && (request.autoRefresh || request.forceRefresh)) {
        Logger.info('ValidateSessionUseCase: Session needs refresh', { 
          userId: session.userId,
          timeUntilExpiry: expiryValidation.timeUntilExpiry 
        });

        if (session.refreshToken) {
          const refreshResult = await this.attemptRefresh(session);
          if (refreshResult.success && refreshResult.session) {
            validationDetails.wasRefreshed = true;
            Logger.info('ValidateSessionUseCase: Session proactively refreshed');
            
            return {
              success: true,
              isValid: true,
              session: refreshResult.session,
              validationDetails
            };
          } else {
            Logger.warn('ValidateSessionUseCase: Proactive refresh failed, session still valid', { 
              error: refreshResult.error 
            });
            // Continue with existing session since it's not expired yet
          }
        }
      }

      // Session is valid
      Logger.info('ValidateSessionUseCase: Session is valid', { 
        userId: session.userId,
        timeUntilExpiry: expiryValidation.timeUntilExpiry 
      });

      return {
        success: true,
        isValid: true,
        session,
        validationDetails
      };

    } catch (error) {
      Logger.error('ValidateSessionUseCase: Session validation failed', { error });
      return {
        success: false,
        isValid: false,
        error: 'Session validation failed',
        validationDetails: {
          exists: false,
          isActive: false,
          isExpired: true,
          needsRefresh: false,
          wasRefreshed: false
        }
      };
    }
  }

  /**
   * Validate session expiry and refresh needs
   */
  private validateExpiry(session: UserSession): {
    isExpired: boolean;
    needsRefresh: boolean;
    timeUntilExpiry: number;
  } {
    try {
      const now = new Date();
      const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
      
      // Check if session has expired
      const isExpired = timeUntilExpiry <= 0;
      
      // Check if we need to refresh (within 5 minutes of expiry)
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
      const needsRefresh = timeUntilExpiry <= refreshThreshold && timeUntilExpiry > 0;

      // Also check access token if available
      if (session.accessToken && !isExpired) {
        const tokenExpired = TokenValidator.isTokenExpired(session.accessToken);
        const tokenNeedsRefresh = TokenValidator.shouldRefreshToken(session.accessToken);
        
        return {
          isExpired: tokenExpired,
          needsRefresh: tokenNeedsRefresh || needsRefresh,
          timeUntilExpiry: Math.max(0, timeUntilExpiry)
        };
      }

      return {
        isExpired,
        needsRefresh,
        timeUntilExpiry: Math.max(0, timeUntilExpiry)
      };

    } catch (error) {
      Logger.warn('ValidateSessionUseCase: Error validating expiry, treating as expired', { 
        error,
        userId: session.userId 
      });
      return {
        isExpired: true,
        needsRefresh: false,
        timeUntilExpiry: 0
      };
    }
  }

  /**
   * Attempt to refresh the session
   */
  private async attemptRefresh(session: UserSession): Promise<{
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

      const refreshResult = await this.refreshTokenUseCase.execute({
        refreshToken: session.refreshToken,
        userId: session.userId
      });

      if (refreshResult.success && refreshResult.session) {
        return {
          success: true,
          session: refreshResult.session
        };
      } else {
        return {
          success: false,
          error: refreshResult.error || 'Token refresh failed'
        };
      }

    } catch (error) {
      Logger.error('ValidateSessionUseCase: Error during refresh attempt', { error });
      return {
        success: false,
        error: 'Refresh attempt failed'
      };
    }
  }

  /**
   * Quick validation check - returns boolean only
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const result = await this.execute({ autoRefresh: false });
      return result.success && result.isValid;
    } catch (error) {
      Logger.error('ValidateSessionUseCase: Error in quick validation', { error });
      return false;
    }
  }

  /**
   * Get session validation details without refresh
   */
  async getValidationDetails(): Promise<SessionValidationResult['validationDetails']> {
    try {
      const result = await this.execute({ autoRefresh: false });
      return result.validationDetails;
    } catch (error) {
      Logger.error('ValidateSessionUseCase: Error getting validation details', { error });
      return {
        exists: false,
        isActive: false,
        isExpired: true,
        needsRefresh: false,
        wasRefreshed: false
      };
    }
  }
}
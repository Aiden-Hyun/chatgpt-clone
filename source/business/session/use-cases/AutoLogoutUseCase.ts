import { Logger } from '../../../service/shared/utils/Logger';
import { SignOutUseCase } from '../../auth/use-cases/SignOutUseCase';
import { UserSession } from '../../interfaces';
import { ISessionRepository } from '../../interfaces';



export class AutoLogoutUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private signOutUseCase: SignOutUseCase
  ) {}

  async execute(request: AutoLogoutRequest = {}): Promise<AutoLogoutResult> {
    try {
      Logger.info('AutoLogoutUseCase: Checking for auto-logout conditions', { 
        reason: request.reason,
        gracePeriodMinutes: request.gracePeriodMinutes,
        forceLogout: request.forceLogout 
      });

      // Get current session
      const session = await this.sessionRepository.get();
      
      if (!session) {
        Logger.info('AutoLogoutUseCase: No session found, no logout needed');
        return {
          success: true,
          loggedOut: false,
          reason: 'No active session'
        };
      }

      // Check if force logout is requested
      if (request.forceLogout) {
        Logger.info('AutoLogoutUseCase: Force logout requested', { 
          userId: session.userId,
          reason: request.reason 
        });
        
        const logoutResult = await this.performLogout(session, request.reason || 'Force logout');
        return logoutResult;
      }

      // Check session expiry
      const expiryCheck = this.checkSessionExpiry(session, request.gracePeriodMinutes);
      
      if (!expiryCheck.shouldLogout) {
        Logger.info('AutoLogoutUseCase: Session is still valid, no logout needed', { 
          userId: session.userId,
          timeUntilExpiry: expiryCheck.timeUntilExpiry 
        });
        
        return {
          success: true,
          loggedOut: false,
          reason: 'Session is still valid',
          sessionDetails: {
            userId: session.userId,
            wasExpired: false,
            expiresAt: session.expiresAt,
            timeExpired: 0
          }
        };
      }

      // Session should be logged out
      Logger.warn('AutoLogoutUseCase: Session expired, performing auto-logout', { 
        userId: session.userId,
        expiresAt: session.expiresAt,
        timeExpired: expiryCheck.timeExpired 
      });

      const logoutResult = await this.performLogout(
        session, 
        request.reason || 'Session expired'
      );

      // Add session details to result
      if (logoutResult.success) {
        logoutResult.sessionDetails = {
          userId: session.userId,
          wasExpired: true,
          expiresAt: session.expiresAt,
          timeExpired: expiryCheck.timeExpired
        };
      }

      return logoutResult;

    } catch (error) {
      Logger.error('AutoLogoutUseCase: Auto-logout check failed', { error });
      return {
        success: false,
        loggedOut: false,
        error: 'Auto-logout check failed'
      };
    }
  }

  /**
   * Check if session should be logged out due to expiry
   */
  private checkSessionExpiry(session: UserSession, gracePeriodMinutes?: number): {
    shouldLogout: boolean;
    timeUntilExpiry: number;
    timeExpired: number;
  } {
    const now = new Date();
    const timeUntilExpiry = session.expiresAt.getTime() - now.getTime();
    const timeExpired = Math.max(0, -timeUntilExpiry);

    // If session hasn't expired yet, no logout needed
    if (timeUntilExpiry > 0) {
      return {
        shouldLogout: false,
        timeUntilExpiry,
        timeExpired: 0
      };
    }

    // Session has expired, check grace period
    const gracePeriod = (gracePeriodMinutes || 0) * 60 * 1000; // Convert to milliseconds
    
    if (gracePeriod > 0 && timeExpired <= gracePeriod) {
      Logger.info('AutoLogoutUseCase: Session expired but within grace period', { 
        userId: session.userId,
        timeExpired,
        gracePeriod 
      });
      
      return {
        shouldLogout: false,
        timeUntilExpiry,
        timeExpired
      };
    }

    return {
      shouldLogout: true,
      timeUntilExpiry,
      timeExpired
    };
  }

  /**
   * Perform the actual logout
   */
  private async performLogout(session: UserSession, reason: string): Promise<AutoLogoutResult> {
    try {
      Logger.info('AutoLogoutUseCase: Performing logout', { 
        userId: session.userId,
        reason 
      });

      // Execute sign out use case
      const signOutResult = await this.signOutUseCase.execute();
      
      if (signOutResult.success) {
        Logger.info('AutoLogoutUseCase: Auto-logout completed successfully', { 
          userId: session.userId,
          reason 
        });
        
        return {
          success: true,
          loggedOut: true,
          reason
        };
      } else {
        Logger.error('AutoLogoutUseCase: Sign out failed during auto-logout', { 
          userId: session.userId,
          error: signOutResult.error 
        });
        
        // Even if sign out fails, clear the session locally
        await this.sessionRepository.clear();
        
        return {
          success: true,
          loggedOut: true,
          reason,
          error: `Sign out failed: ${signOutResult.error}`
        };
      }

    } catch (error) {
      Logger.error('AutoLogoutUseCase: Error during logout', { 
        userId: session.userId,
        error 
      });
      
      // Attempt to clear session even if logout fails
      try {
        await this.sessionRepository.clear();
        Logger.info('AutoLogoutUseCase: Session cleared after logout error');
      } catch (clearError) {
        Logger.error('AutoLogoutUseCase: Failed to clear session after logout error', { 
          clearError 
        });
      }
      
      return {
        success: false,
        loggedOut: false,
        reason,
        error: 'Logout failed'
      };
    }
  }

  /**
   * Check if auto-logout should occur without performing it
   */
  async shouldAutoLogout(gracePeriodMinutes?: number): Promise<{
    shouldLogout: boolean;
    reason?: string;
    sessionDetails?: {
      userId: string;
      expiresAt: Date;
      timeExpired: number;
    };
  }> {
    try {
      const session = await this.sessionRepository.get();
      
      if (!session) {
        return {
          shouldLogout: false,
          reason: 'No active session'
        };
      }

      const expiryCheck = this.checkSessionExpiry(session, gracePeriodMinutes);
      
      return {
        shouldLogout: expiryCheck.shouldLogout,
        reason: expiryCheck.shouldLogout ? 'Session expired' : 'Session is valid',
        sessionDetails: expiryCheck.shouldLogout ? {
          userId: session.userId,
          expiresAt: session.expiresAt,
          timeExpired: expiryCheck.timeExpired
        } : undefined
      };

    } catch (error) {
      Logger.error('AutoLogoutUseCase: Error checking auto-logout condition', { error });
      return {
        shouldLogout: false,
        reason: 'Error checking session'
      };
    }
  }

  /**
   * Schedule auto-logout for a specific time
   */
  async scheduleAutoLogout(delayMinutes: number, reason?: string): Promise<{
    success: boolean;
    scheduledAt: Date;
    error?: string;
  }> {
    try {
      const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      
      Logger.info('AutoLogoutUseCase: Scheduling auto-logout', { 
        delayMinutes,
        scheduledAt,
        reason 
      });

      // In a real implementation, you might use a job scheduler or timer
      // For now, we'll just log the schedule
      setTimeout(async () => {
        Logger.info('AutoLogoutUseCase: Executing scheduled auto-logout', { reason });
        await this.execute({ 
          forceLogout: true, 
          reason: reason || 'Scheduled logout' 
        });
      }, delayMinutes * 60 * 1000);

      return {
        success: true,
        scheduledAt
      };

    } catch (error) {
      Logger.error('AutoLogoutUseCase: Error scheduling auto-logout', { error });
      return {
        success: false,
        scheduledAt: new Date(),
        error: 'Failed to schedule auto-logout'
      };
    }
  }
}

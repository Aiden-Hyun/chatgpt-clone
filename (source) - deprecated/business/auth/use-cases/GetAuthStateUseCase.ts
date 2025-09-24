import { Logger } from '../../../service/shared/utils/Logger';
import { ISessionRepository, UserSession } from '../../interfaces';

/**
 * Result type for GetAuthStateUseCase
 */
export interface GetAuthStateResult {
  success: boolean;
  session: UserSession | null;
  isLoading: boolean;
  error?: string;
}

/**
 * GetAuthStateUseCase - Get current authentication state without side effects
 * 
 * This use case provides a way to get the current auth state without setting up
 * monitoring or subscriptions. It's useful for:
 * - Initial auth state checks
 * - One-time auth status queries
 * - Components that need auth state but don't want to subscribe to changes
 * 
 * Unlike MonitorAuthStateUseCase, this doesn't set up any listeners or callbacks.
 */
export class GetAuthStateUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) {}

  async execute(): Promise<GetAuthStateResult> {
    try {
      Logger.info('GetAuthStateUseCase: Getting current auth state');

      // Get current session from repository
      const session = await this.sessionRepository.get();
      
      // Check if session is valid
      const isValidSession = session ? await this.sessionRepository.isValid(session) : false;
      
      Logger.info('GetAuthStateUseCase: Auth state retrieved', { 
        hasSession: !!session,
        isValid: isValidSession,
        userId: session?.userId
      });

      return {
        success: true,
        session: isValidSession ? session : null,
        isLoading: false
      };

    } catch (error) {
      Logger.error('GetAuthStateUseCase: Failed to get auth state', { error });
      
      return {
        success: false,
        session: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get auth state'
      };
    }
  }

  /**
   * Get just the session without full result wrapper
   * Convenience method for simple session checks
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const result = await this.execute();
      return result.success ? result.session : null;
    } catch (error) {
      Logger.error('GetAuthStateUseCase: Failed to get session', { error });
      return null;
    }
  }

  /**
   * Check if user is currently authenticated
   * Returns true if there's a valid session
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return !!session;
    } catch (error) {
      Logger.error('GetAuthStateUseCase: Failed to check authentication', { error });
      return false;
    }
  }

  /**
   * Get current user ID if authenticated
   */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const session = await this.getSession();
      return session?.userId || null;
    } catch (error) {
      Logger.error('GetAuthStateUseCase: Failed to get user ID', { error });
      return null;
    }
  }
}

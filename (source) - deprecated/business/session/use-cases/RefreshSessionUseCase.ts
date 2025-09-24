import { UserRepository } from '../../../persistence/auth/repositories/UserRepository';
import { SessionRepository } from '../../../persistence/session/repositories/SessionRepository';
import { SessionValidator } from '../../../service/session/validators/SessionValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { RefreshSessionResult } from '../../interfaces';


export class RefreshSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository
  ) {}

  async execute(): Promise<RefreshSessionResult> {
    try {
      // Get current session
      const currentSession = await this.sessionRepository.get();
      
      if (!currentSession) {
        return { success: false, error: 'No session found' };
      }

      // Check if session can be refreshed
      if (!currentSession.canRefresh()) {
        Logger.warn('Session cannot be refreshed', { userId: currentSession.userId });
        return { success: false, error: 'Session cannot be refreshed' };
      }

      // Verify user still exists
      const user = await this.userRepository.findById(currentSession.userId);
      if (!user) {
        Logger.warn('User not found during refresh', { userId: currentSession.userId });
        await this.sessionRepository.clear();
        return { success: false, error: 'User no longer exists' };
      }

      // Attempt to refresh session
      const refreshResult = await this.sessionRepository.refresh(currentSession.refreshToken!);
      
      if (!refreshResult.success) {
        Logger.error('Session refresh failed', { 
          userId: currentSession.userId, 
          error: refreshResult.error 
        });
        return { success: false, error: refreshResult.error };
      }

      // Validate the refreshed session
      const validation = SessionValidator.validateSession(refreshResult.session!);
      if (!validation.isValid) {
        Logger.error('Refreshed session is invalid', { 
          userId: currentSession.userId, 
          error: validation.error 
        });
        await this.sessionRepository.clear();
        return { success: false, error: validation.error };
      }

      Logger.info('Session refreshed successfully', { userId: currentSession.userId });
      return { success: true, session: refreshResult.session };

    } catch (error) {
      Logger.error('Session refresh failed', { error });
      return { success: false, error: 'Session refresh failed' };
    }
  }
}

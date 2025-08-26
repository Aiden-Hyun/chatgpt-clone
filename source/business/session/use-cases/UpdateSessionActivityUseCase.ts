import { SessionRepository } from '../../../persistence/session/repositories/SessionRepository';
import { Logger } from '../../../service/shared/utils/Logger';

export interface UpdateSessionActivityResult {
  success: boolean;
  error?: string;
}

export class UpdateSessionActivityUseCase {
  constructor(
    private sessionRepository: SessionRepository
  ) {}

  async execute(): Promise<UpdateSessionActivityResult> {
    try {
      // Get current session
      const session = await this.sessionRepository.get();
      
      if (!session) {
        return { success: false, error: 'No session found' };
      }

      // Check if session is still valid
      if (session.isExpired()) {
        Logger.info('Session expired during activity update', { userId: session.userId });
        await this.sessionRepository.clear();
        return { success: false, error: 'Session has expired' };
      }

      // Update session activity
      await this.sessionRepository.updateLastActivity(session);

      Logger.debug('Session activity updated', { userId: session.userId });
      return { success: true };

    } catch (error) {
      Logger.error('Failed to update session activity', { error });
      return { success: false, error: 'Failed to update session activity' };
    }
  }
}

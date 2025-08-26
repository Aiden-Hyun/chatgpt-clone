import { SessionRepository } from '../../persistence/repositories/SessionRepository';
import { UserRepository } from '../../persistence/repositories/UserRepository';
import { SessionValidator } from '../../service/utils/SessionValidator';
import { Logger } from '../../service/utils/Logger';
import { UserSession } from '../entities/UserSession';

export interface GetSessionResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

export class GetSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository
  ) {}

  async execute(): Promise<GetSessionResult> {
    try {
      // Get session from storage
      const session = await this.sessionRepository.get();
      
      if (!session) {
        return { success: false, error: 'No session found' };
      }

      // Validate session
      const validation = SessionValidator.validateSession(session);
      if (!validation.isValid) {
        Logger.warn('Invalid session found', { error: validation.error });
        await this.sessionRepository.clear();
        return { success: false, error: validation.error };
      }

      // Check if session is expired
      if (session.isExpired()) {
        Logger.info('Session expired, clearing', { userId: session.userId });
        await this.sessionRepository.clear();
        return { success: false, error: 'Session has expired' };
      }

      // Verify user still exists
      const user = await this.userRepository.findById(session.userId);
      if (!user) {
        Logger.warn('User not found for session', { userId: session.userId });
        await this.sessionRepository.clear();
        return { success: false, error: 'User no longer exists' };
      }

      // Check session security
      if (!SessionValidator.isSessionSecure(session)) {
        Logger.warn('Insecure session detected', { userId: session.userId });
        await this.sessionRepository.clear();
        return { success: false, error: 'Session security check failed' };
      }

      Logger.info('Session retrieved successfully', { userId: session.userId });
      return { success: true, session };

    } catch (error) {
      Logger.error('Failed to get session', { error });
      return { success: false, error: 'Failed to retrieve session' };
    }
  }
}

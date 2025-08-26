import { SessionRepository } from '../../persistence/repositories/SessionRepository';
import { SessionValidator } from '../../service/utils/SessionValidator';
import { Logger } from '../../service/utils/Logger';

export interface ValidateSessionResult {
  isValid: boolean;
  error?: string;
}

export class ValidateSessionUseCase {
  constructor(
    private sessionRepository: SessionRepository
  ) {}

  async execute(): Promise<ValidateSessionResult> {
    try {
      // Get session from storage
      const session = await this.sessionRepository.get();
      
      if (!session) {
        return { isValid: false, error: 'No session found' };
      }

      // Validate session structure
      const validation = SessionValidator.validateSession(session);
      if (!validation.isValid) {
        Logger.warn('Session validation failed', { error: validation.error });
        return { isValid: false, error: validation.error };
      }

      // Check if session is expired
      if (session.isExpired()) {
        Logger.info('Session is expired', { userId: session.userId });
        return { isValid: false, error: 'Session has expired' };
      }

      // Check session security
      if (!SessionValidator.isSessionSecure(session)) {
        Logger.warn('Session security check failed', { userId: session.userId });
        return { isValid: false, error: 'Session security check failed' };
      }

      Logger.debug('Session validation successful', { userId: session.userId });
      return { isValid: true };

    } catch (error) {
      Logger.error('Session validation failed', { error });
      return { isValid: false, error: 'Session validation failed' };
    }
  }
}

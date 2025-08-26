import { SessionRepository } from '../../persistence/repositories/SessionRepository';
import { UserRepository } from '../../persistence/repositories/UserRepository';
import { Logger } from '../../service/utils/Logger';

export interface SignOutResult {
  success: boolean;
  error?: string;
}

export class SignOutUseCase {
  constructor(
    private sessionRepository: SessionRepository,
    private userRepository: UserRepository
  ) {}

  async execute(): Promise<SignOutResult> {
    try {
      // Get current session
      const currentSession = await this.sessionRepository.get();
      
      if (currentSession) {
        // Business rule: Log the sign out
        Logger.info('User signed out', { userId: currentSession.userId });
      }

      // Business rule: Clear session
      await this.sessionRepository.clear();

      // Business rule: Clear any cached user data
      await this.userRepository.clearCache();

      return { success: true };

    } catch (error) {
      Logger.error('Sign out failed', { error });
      
      // Even if clearing fails, we should still return success
      // to allow the user to continue with the sign out flow
      return { success: true };
    }
  }
}

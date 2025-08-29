import { Logger } from '../../../service/shared/utils/Logger';
import { ISessionRepository } from '../../interfaces';
import { IUserRepository } from '../../interfaces';


export class SignOutUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(): Promise<SignOutResult> {
    try {
      // Get current session for logging
      const currentSession = await this.sessionRepository.get();
      
      if (currentSession) {
        Logger.info('SignOutUseCase: User signing out', { userId: currentSession.userId });
      }

      // Business rule: Sign out from Supabase
      const signOutResult = await this.userRepository.signOut();
      if (!signOutResult.success) {
        Logger.warn('SignOutUseCase: Supabase signout failed, continuing with local cleanup', { error: signOutResult.error });
      }

      // Business rule: Clear local session storage
      await this.sessionRepository.clear();

      // Business rule: Clear any cached user data
      await this.userRepository.clearCache();

      Logger.info('SignOutUseCase: Sign out completed successfully');
      return { success: true };

    } catch (error) {
      Logger.error('SignOutUseCase: Sign out failed', { error });
      
      // Even if clearing fails, we should still return success
      // to allow the user to continue with the sign out flow
      return { success: true };
    }
  }
}

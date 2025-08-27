import { SessionRepository } from '../../../persistence/session/repositories/SessionRepository';
import { UserRepository } from '../../../persistence/auth/repositories/UserRepository';
import { Logger } from '../../../service/shared/utils/Logger';
import { EmailValidator } from '../../../service/auth/validators/EmailValidator';
import { PasswordValidator } from '../../../service/auth/validators/PasswordValidator';
import { User } from '../entities/User';
import { UserSession } from '../../session/entities/UserSession';

export interface SignInResult {
  success: boolean;
  user?: User;
  session?: UserSession;
  error?: string;
  isNetworkError?: boolean;
}

export class SignInUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository
  ) {}

  async execute(request: { email: string; password: string }): Promise<SignInResult> {
    try {
      Logger.info('SignInUseCase: Starting sign in process', { email: request.email });

      // Business validation
      const emailValidation = EmailValidator.validate(request.email);
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.error };
      }

      const passwordValidation = PasswordValidator.validate(request.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      // Authenticate with Supabase - this handles user existence check internally
      const authResult = await this.userRepository.authenticate(request.email, request.password);
      if (!authResult.success) {
        Logger.warn('SignInUseCase: Authentication failed', { email: request.email, error: authResult.error });
        return { 
          success: false, 
          error: authResult.error,
          isNetworkError: (authResult as any).isNetworkError 
        };
      }

      if (!authResult.user) {
        return { success: false, error: 'No user data returned from authentication' };
      }

      // Create UserSession entity from Supabase auth result
      const session = new UserSession({
        userId: authResult.user.id,
        isAuthenticated: true,
        permissions: authResult.user.permissions,
        lastActivity: new Date(),
        expiresAt: this.calculateExpiryTime(),
        // Note: In real implementation, we'd get these from Supabase session
        accessToken: 'will-be-set-by-existing-auth-context',
        refreshToken: 'will-be-set-by-existing-auth-context'
      });

      // Save session to local storage
      await this.sessionRepository.save(session);

      Logger.info('SignInUseCase: User signed in successfully', { userId: authResult.user.id });

      return { 
        success: true, 
        user: authResult.user, 
        session 
      };

    } catch (error) {
      Logger.error('SignInUseCase: Sign in failed', { error, email: request.email });
      return { success: false, error: 'Authentication failed' };
    }
  }

  private calculateExpiryTime(): Date {
    const now = new Date();
    now.setHours(now.getHours() + 24); // 24 hour session
    return now;
  }
}

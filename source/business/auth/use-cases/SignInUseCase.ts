import { EmailValidator } from '../../../service/auth/validators/EmailValidator';
import { PasswordValidator } from '../../../service/auth/validators/PasswordValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { UserSession } from '../../session/entities/UserSession';
import { ISessionRepository } from '../../session/interfaces/ISessionRepository';
import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';

export interface SignInResult {
  success: boolean;
  user?: User;
  session?: UserSession;
  error?: string;
  isNetworkError?: boolean;
}

export class SignInUseCase {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository
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
      const session = new UserSession(
        authResult.user.id,
        true,
        authResult.user.permissions || ['user'],
        new Date(),
        this.calculateExpiryTime(),
        'will-be-set-by-existing-auth-context', // refreshToken
        'will-be-set-by-existing-auth-context'  // accessToken
      );

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

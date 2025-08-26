import { SessionRepository } from '../../persistence/repositories/SessionRepository';
import { UserRepository } from '../../persistence/repositories/UserRepository';
import { Logger } from '../../service/utils/Logger';
import { EmailValidator } from '../../service/validators/EmailValidator';
import { PasswordValidator } from '../../service/validators/PasswordValidator';
import { User } from '../entities/User';
import { UserSession } from '../entities/UserSession';

export interface SignInResult {
  success: boolean;
  user?: User;
  session?: UserSession;
  error?: string;
}

export class SignInUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository
  ) {}

  async execute(request: { email: string; password: string }): Promise<SignInResult> {
    try {
      // Business validation
      const emailValidation = EmailValidator.validate(request.email);
      if (!emailValidation.isValid) {
        return { success: false, error: emailValidation.error };
      }

      const passwordValidation = PasswordValidator.validate(request.password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error };
      }

      // Business rule: Check if user exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (!existingUser) {
        return { success: false, error: 'User not found' };
      }

      // Business rule: Attempt authentication
      const authResult = await this.userRepository.authenticate(request.email, request.password);
      if (!authResult.success) {
        return { success: false, error: authResult.error };
      }

      // Business rule: Create session
      const session = new UserSession({
        userId: authResult.user.id,
        isAuthenticated: true,
        permissions: authResult.user.permissions,
        lastActivity: new Date(),
        expiresAt: this.calculateExpiryTime()
      });

      // Save session
      await this.sessionRepository.save(session);

      Logger.info('User signed in successfully', { userId: authResult.user.id });

      return { 
        success: true, 
        user: authResult.user, 
        session 
      };

    } catch (error) {
      Logger.error('Sign in failed', { error, email: request.email });
      return { success: false, error: 'Authentication failed' };
    }
  }

  private calculateExpiryTime(): Date {
    const now = new Date();
    now.setHours(now.getHours() + 24); // 24 hour session
    return now;
  }
}

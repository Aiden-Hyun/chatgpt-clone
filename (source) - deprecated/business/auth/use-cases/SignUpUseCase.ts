import { EmailValidator } from '../../../service/auth/validators/EmailValidator';
import { PasswordValidator } from '../../../service/auth/validators/PasswordValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { IUserRepository, SignUpResult } from '../../interfaces';


export class SignUpUseCase {
  constructor(
    private userRepository: IUserRepository
  ) {}

  async execute(request: { 
    email: string; 
    password: string; 
    displayName: string;
    confirmPassword?: string;
  }): Promise<SignUpResult> {
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

      // Password confirmation validation (business rule)
      if (request.confirmPassword && request.password !== request.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (request.displayName.length < 2) {
        return { success: false, error: 'Display name must be at least 2 characters' };
      }

      if (request.displayName.length > 50) {
        return { success: false, error: 'Display name must be less than 50 characters' };
      }

      // Business rule: Check if user already exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Business rule: Create user
      const createResult = await this.userRepository.create({
        email: request.email,
        password: request.password,
        displayName: request.displayName
      });

      if (!createResult.success) {
        return { success: false, error: createResult.error };
      }

      Logger.info('User signed up successfully', { userId: createResult.user.id });

      return { 
        success: true, 
        user: createResult.user,
        requiresEmailVerification: createResult.requiresEmailVerification
      };

    } catch (error) {
      Logger.error('Sign up failed', { error, email: request.email });
      return { success: false, error: 'Registration failed' };
    }
  }
}

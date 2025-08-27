import { EmailValidator } from '../../../service/auth/validators/EmailValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { IUserRepository } from '../interfaces/IUserRepository';

export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
  isNetworkError?: boolean;
}

export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: IUserRepository
  ) {}

  async execute(request: RequestPasswordResetRequest): Promise<RequestPasswordResetResult> {
    try {
      Logger.info('RequestPasswordResetUseCase: Starting password reset request', { 
        email: request.email 
      });

      // Validate email format
      const emailValidation = EmailValidator.validate(request.email);
      if (!emailValidation.isValid) {
        Logger.warn('RequestPasswordResetUseCase: Invalid email format', { 
          email: request.email,
          error: emailValidation.error 
        });
        return {
          success: false,
          error: emailValidation.error
        };
      }

      // Check if email is provided
      if (!request.email.trim()) {
        return {
          success: false,
          error: 'Email address is required'
        };
      }

      // Call repository to request password reset
      const resetResult = await this.userRepository.requestPasswordReset(request.email.trim().toLowerCase());

      if (resetResult.success) {
        Logger.info('RequestPasswordResetUseCase: Password reset request successful', { 
          email: request.email 
        });
        
        return {
          success: true,
          message: 'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.'
        };
      } else {
        Logger.warn('RequestPasswordResetUseCase: Password reset request failed', { 
          email: request.email,
          error: resetResult.error 
        });
        
        return {
          success: false,
          error: resetResult.error || 'Failed to send password reset email',
          isNetworkError: resetResult.isNetworkError
        };
      }

    } catch (error) {
      Logger.error('RequestPasswordResetUseCase: Password reset request failed', { 
        error,
        email: request.email 
      });
      
      return {
        success: false,
        error: 'Failed to process password reset request',
        isNetworkError: true
      };
    }
  }

  /**
   * Validate email without making the request
   */
  validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email.trim()) {
      return {
        isValid: false,
        error: 'Email address is required'
      };
    }

    return EmailValidator.validate(email.trim());
  }

  /**
   * Check if email format is valid for password reset
   */
  isValidResetEmail(email: string): boolean {
    const validation = this.validateEmail(email);
    return validation.isValid;
  }
}

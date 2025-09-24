import { PasswordValidator } from '../../../service/auth/validators/PasswordValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { IUserRepository } from '../../interfaces';



export class ResetPasswordUseCase {
  constructor(
    private userRepository: IUserRepository
  ) {}

  async execute(request: ResetPasswordRequest): Promise<ResetPasswordResult> {
    try {
      Logger.info('ResetPasswordUseCase: Starting password reset', { 
        hasToken: !!request.token 
      });

      // Validate input
      const validationResult = this.validateResetRequest(request);
      if (!validationResult.isValid) {
        Logger.warn('ResetPasswordUseCase: Invalid reset request', { 
          error: validationResult.error 
        });
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Call repository to reset password
      const resetResult = await this.userRepository.resetPassword(
        request.token.trim(),
        request.newPassword
      );

      if (resetResult.success) {
        Logger.info('ResetPasswordUseCase: Password reset successful');
        
        return {
          success: true,
          message: 'Your password has been successfully reset. You can now sign in with your new password.'
        };
      } else {
        Logger.warn('ResetPasswordUseCase: Password reset failed', { 
          error: resetResult.error 
        });
        
        return {
          success: false,
          error: resetResult.error || 'Failed to reset password',
          isNetworkError: resetResult.isNetworkError
        };
      }

    } catch (error) {
      Logger.error('ResetPasswordUseCase: Password reset failed', { error });
      
      return {
        success: false,
        error: 'Failed to reset password',
        isNetworkError: true
      };
    }
  }

  /**
   * Validate password reset request
   */
  private validateResetRequest(request: ResetPasswordRequest): {
    isValid: boolean;
    error?: string;
  } {
    // Validate token
    if (!request.token || !request.token.trim()) {
      return {
        isValid: false,
        error: 'Reset token is required'
      };
    }

    // Validate new password
    if (!request.newPassword) {
      return {
        isValid: false,
        error: 'New password is required'
      };
    }

    const passwordValidation = PasswordValidator.validate(request.newPassword);
    if (!passwordValidation.isValid) {
      return {
        isValid: false,
        error: passwordValidation.error
      };
    }

    // Validate password confirmation
    if (!request.confirmPassword) {
      return {
        isValid: false,
        error: 'Password confirmation is required'
      };
    }

    if (request.newPassword !== request.confirmPassword) {
      return {
        isValid: false,
        error: 'Passwords do not match'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate new password without token
   */
  validateNewPassword(password: string, confirmPassword: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!password) {
      return {
        isValid: false,
        error: 'Password is required'
      };
    }

    const passwordValidation = PasswordValidator.validate(password);
    if (!passwordValidation.isValid) {
      return {
        isValid: false,
        error: passwordValidation.error
      };
    }

    if (!confirmPassword) {
      return {
        isValid: false,
        error: 'Password confirmation is required'
      };
    }

    if (password !== confirmPassword) {
      return {
        isValid: false,
        error: 'Passwords do not match'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate reset token format
   */
  validateResetToken(token: string): { isValid: boolean; error?: string } {
    if (!token || !token.trim()) {
      return {
        isValid: false,
        error: 'Reset token is required'
      };
    }

    // Basic token format validation
    const trimmedToken = token.trim();
    
    // Check minimum length (tokens are typically long)
    if (trimmedToken.length < 10) {
      return {
        isValid: false,
        error: 'Invalid reset token format'
      };
    }

    // Check for valid characters (alphanumeric, hyphens, underscores)
    const validTokenPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!validTokenPattern.test(trimmedToken)) {
      return {
        isValid: false,
        error: 'Invalid reset token format'
      };
    }

    return { isValid: true };
  }

  /**
   * Check if passwords match
   */
  doPasswordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }
}

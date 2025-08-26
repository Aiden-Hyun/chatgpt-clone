// Use case for user authentication - contains business logic
import { isValidEmail } from '../../services/utils/textHelpers';
import { AuthResultDTO, SignInDTO, SignUpDTO } from '../dto/AuthDTO';
import { UserEntity } from '../entities/User';
import { IAuthService } from '../interfaces/IAuthService';

export class AuthenticateUserUseCase {
  constructor(
    private readonly authService: IAuthService
  ) {}

  async signIn(request: SignInDTO): Promise<AuthResultDTO> {
    try {
      // Validate input
      if (!request.email || !isValidEmail(request.email)) {
        return {
          user: { id: '', email: '' },
          session: { accessToken: '', expiresAt: new Date() },
          success: false,
          error: 'Invalid email address'
        };
      }

      if (!request.password || request.password.length < 6) {
        return {
          user: { id: '', email: '' },
          session: { accessToken: '', expiresAt: new Date() },
          success: false,
          error: 'Password must be at least 6 characters'
        };
      }

      // Authenticate with service
      const session = await this.authService.signInWithEmail(
        request.email.toLowerCase().trim(),
        request.password
      );

      return {
        user: {
          id: session.user.id,
          email: session.user.email
        },
        session: {
          accessToken: session.accessToken,
          expiresAt: session.expiresAt
        },
        success: true
      };

    } catch (error) {
      console.error('AuthenticateUserUseCase signIn error:', error);
      return {
        user: { id: '', email: '' },
        session: { accessToken: '', expiresAt: new Date() },
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  async signUp(request: SignUpDTO): Promise<AuthResultDTO> {
    try {
      // Validate input
      if (!request.email || !isValidEmail(request.email)) {
        return {
          user: { id: '', email: '' },
          session: { accessToken: '', expiresAt: new Date() },
          success: false,
          error: 'Invalid email address'
        };
      }

      if (!request.password || request.password.length < 6) {
        return {
          user: { id: '', email: '' },
          session: { accessToken: '', expiresAt: new Date() },
          success: false,
          error: 'Password must be at least 6 characters'
        };
      }

      // Register with service
      const session = await this.authService.signUpWithEmail(
        request.email.toLowerCase().trim(),
        request.password
      );

      return {
        user: {
          id: session.user.id,
          email: session.user.email
        },
        session: {
          accessToken: session.accessToken,
          expiresAt: session.expiresAt
        },
        success: true
      };

    } catch (error) {
      console.error('AuthenticateUserUseCase signUp error:', error);
      return {
        user: { id: '', email: '' },
        session: { accessToken: '', expiresAt: new Date() },
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.authService.signOut();
      return { success: true };
    } catch (error) {
      console.error('AuthenticateUserUseCase signOut error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }
}

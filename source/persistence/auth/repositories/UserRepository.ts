import { Logger } from '../../../service/shared/utils/Logger';
import { CreateUserResult, IUserRepository, User, SocialAuthData, SocialAuthOptions } from '../../interfaces/auth';
import { SocialAuthAdapter } from '../adapters/SocialAuthAdapter';
import { SupabaseAuthAdapter } from '../adapters/SupabaseAuthAdapter';
import { UserMapper } from '../mappers/UserMapper';

export class UserRepository implements IUserRepository {
  constructor(
    private authAdapter: SupabaseAuthAdapter = new SupabaseAuthAdapter(),
    private socialAuthAdapter: SocialAuthAdapter = new SocialAuthAdapter(),
    private userMapper: UserMapper = new UserMapper()
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userData = await this.authAdapter.getUserByEmail(email);
      return userData ? this.userMapper.toDomain(userData) : null;
    } catch (error) {
      Logger.error('Failed to find user by email', { error, email });
      return null;
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      // This would typically query the user profile table
      // For now, we'll use the current user method if it matches
      const currentUser = await this.authAdapter.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        return this.userMapper.toDomain(currentUser);
      }
      return null;
    } catch (error) {
      Logger.error('Failed to find user by ID', { error, userId });
      return null;
    }
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const authData = await this.authAdapter.signIn(email, password);
      
      if (authData.success && authData.user) {
        const user = this.userMapper.toDomain(authData.user);
        return { success: true, user };
      } else {
        return { success: false, error: authData.error };
      }
    } catch (error) {
      Logger.error('Authentication failed', { error, email });
      return { success: false, error: 'Authentication failed' };
    }
  }

  async create(userData: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<CreateUserResult> {
    try {
      const createData = await this.authAdapter.signUp(userData);
      
      if (createData.success && createData.user) {
        const user = this.userMapper.toDomain(createData.user);
        return { 
          success: true, 
          user,
          requiresEmailVerification: createData.requiresEmailVerification
        };
      } else {
        return { success: false, error: createData.error };
      }
    } catch (error) {
      Logger.error('User creation failed', { error, email: userData.email });
      return { success: false, error: 'User creation failed' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await this.authAdapter.getCurrentUser();
      return userData ? this.userMapper.toDomain(userData) : null;
    } catch (error) {
      Logger.error('Failed to get current user', { error });
      return null;
    }
  }

  async updateProfile(updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.authAdapter.updateUserProfile(updates);
    } catch (error) {
      Logger.error('Failed to update user profile', { error });
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  async deleteUser(): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.authAdapter.deleteUser();
    } catch (error) {
      Logger.error('Failed to delete user', { error });
      return { success: false, error: 'Failed to delete user' };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.authAdapter.signOut();
    } catch (error) {
      Logger.error('Failed to sign out', { error });
      return { success: false, error: 'Failed to sign out' };
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      return await this.authAdapter.refreshToken(refreshToken);
    } catch (error) {
      Logger.error('Failed to refresh token', { error });
      return { 
        success: false, 
        error: 'Failed to refresh token',
        isNetworkError: true 
      };
    }
  }

  async requestPasswordReset(email: string): Promise<RequestResetResult> {
    try {
      Logger.info('UserRepository: Requesting password reset', { email });
      
      // Use Supabase auth to request password reset
      const result = await this.authAdapter.requestPasswordReset(email);
      
      if (result.success) {
        Logger.info('UserRepository: Password reset request successful', { email });
        return { success: true };
      } else {
        Logger.warn('UserRepository: Password reset request failed', { 
          email, 
          error: result.error 
        });
        return {
          success: false,
          error: result.error,
          isNetworkError: result.isNetworkError
        };
      }
    } catch (error) {
      Logger.error('UserRepository: Password reset request failed', { error, email });
      return {
        success: false,
        error: 'Failed to request password reset',
        isNetworkError: true
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
    try {
      Logger.info('UserRepository: Resetting password');
      
      // Use Supabase auth to reset password
      const result = await this.authAdapter.resetPassword(token, newPassword);
      
      if (result.success) {
        Logger.info('UserRepository: Password reset successful');
        return { success: true };
      } else {
        Logger.warn('UserRepository: Password reset failed', { error: result.error });
        return {
          success: false,
          error: result.error,
          isNetworkError: result.isNetworkError
        };
      }
    } catch (error) {
      Logger.error('UserRepository: Password reset failed', { error });
      return {
        success: false,
        error: 'Failed to reset password',
        isNetworkError: true
      };
    }
  }

  async authenticateWithProvider(provider: string, options?: SocialAuthOptions): Promise<SocialAuthResult> {
    try {
      Logger.info('UserRepository: Authenticating with social provider', { provider });
      
      const result = await this.socialAuthAdapter.authenticateWithProvider(provider, options);
      
      if (result.success && result.user) {
        // Map the user data to our domain model
        const user = this.userMapper.toDomain(result.user);
        
        return {
          success: true,
          user,
          session: result.session,
          providerData: result.providerData
        };
      } else {
        return {
          success: false,
          error: result.error,
          isNetworkError: result.isNetworkError,
          requiresAdditionalInfo: result.requiresAdditionalInfo,
          providerData: result.providerData
        };
      }
    } catch (error) {
      Logger.error('UserRepository: Social authentication failed', { error, provider });
      return {
        success: false,
        error: 'Social authentication failed',
        isNetworkError: true
      };
    }
  }

  async completeSocialAuth(provider: string, data: SocialAuthData): Promise<SocialAuthResult> {
    try {
      Logger.info('UserRepository: Completing social authentication', { provider });
      
      const result = await this.socialAuthAdapter.completeSocialAuth(provider, data);
      
      if (result.success && result.user) {
        // Map the user data to our domain model
        const user = this.userMapper.toDomain(result.user);
        
        return {
          success: true,
          user,
          session: result.session
        };
      } else {
        return {
          success: false,
          error: result.error,
          isNetworkError: result.isNetworkError
        };
      }
    } catch (error) {
      Logger.error('UserRepository: Failed to complete social auth', { error, provider });
      return {
        success: false,
        error: 'Failed to complete social authentication',
        isNetworkError: true
      };
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Clear any cached user data
      // This is a placeholder for actual cache clearing logic
      Logger.debug('User cache cleared');
    } catch (error) {
      Logger.error('Failed to clear user cache', { error });
    }
  }
}

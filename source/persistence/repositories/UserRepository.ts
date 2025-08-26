import { User } from '../../business/entities/User';
import { Logger } from '../../service/utils/Logger';
import { SupabaseAuthAdapter } from '../adapters/SupabaseAuthAdapter';
import { UserMapper } from '../mappers/UserMapper';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface CreateUserResult {
  success: boolean;
  user?: User;
  requiresEmailVerification?: boolean;
  error?: string;
}

export class UserRepository {
  constructor(
    private authAdapter: SupabaseAuthAdapter = new SupabaseAuthAdapter(),
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

  async updateProfile(userId: string, updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<boolean> {
    try {
      return await this.authAdapter.updateUserProfile(userId, updates);
    } catch (error) {
      Logger.error('Failed to update user profile', { error, userId });
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      return await this.authAdapter.deleteUser(userId);
    } catch (error) {
      Logger.error('Failed to delete user', { error, userId });
      return false;
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

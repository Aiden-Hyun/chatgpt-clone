// Authentication service implementation using Supabase
import { IAuthService, Session } from '../../business/interfaces/IAuthService';
import { User, UserEntity } from '../../business/entities/User';
import { SupabaseAdapter } from './SupabaseAdapter';

export class SupabaseAuthService implements IAuthService {
  private adapter: SupabaseAdapter;

  constructor() {
    this.adapter = SupabaseAdapter.getInstance();
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const session = await this.adapter.getCurrentSession();
      
      if (!session || !session.user) {
        return null;
      }

      const user = new UserEntity(
        session.user.id,
        session.user.email || '',
        new Date(session.user.created_at),
        session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at) : undefined
      );

      return {
        user: user.toJSON(),
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at! * 1000)
      };
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<Session> {
    try {
      const { session, user } = await this.adapter.signInWithEmail(email, password);
      
      if (!session || !user) {
        throw new Error('Sign in failed - no session returned');
      }

      const userEntity = new UserEntity(
        user.id,
        user.email || '',
        new Date(user.created_at),
        user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
      );

      return {
        user: userEntity.toJSON(),
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at! * 1000)
      };
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<Session> {
    try {
      const { session, user } = await this.adapter.signUpWithEmail(email, password);
      
      if (!session || !user) {
        throw new Error('Sign up failed - no session returned');
      }

      const userEntity = new UserEntity(
        user.id,
        user.email || '',
        new Date(user.created_at),
        user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined
      );

      return {
        user: userEntity.toJSON(),
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at! * 1000)
      };
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.adapter.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.adapter.resetPassword(email);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // For now, Supabase handles user profile updates through their auth API
      // This would need to be implemented based on your specific requirements
      throw new Error('Profile updates not yet implemented');
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
}

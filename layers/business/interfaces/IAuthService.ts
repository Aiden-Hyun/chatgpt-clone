// Business layer interface - Port for authentication
import { User } from '../entities/User';

export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface IAuthService {
  /**
   * Get current user session
   */
  getCurrentSession(): Promise<Session | null>;
  
  /**
   * Sign in with email and password
   */
  signInWithEmail(email: string, password: string): Promise<Session>;
  
  /**
   * Sign up with email and password
   */
  signUpWithEmail(email: string, password: string): Promise<Session>;
  
  /**
   * Sign out current user
   */
  signOut(): Promise<void>;
  
  /**
   * Reset password for email
   */
  resetPassword(email: string): Promise<void>;
  
  /**
   * Update user profile
   */
  updateProfile(userId: string, updates: Partial<User>): Promise<User>;
}

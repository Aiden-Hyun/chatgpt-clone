import { User } from '../entities/User';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isNetworkError?: boolean;
}

export interface CreateUserResult {
  success: boolean;
  user: User;
  requiresEmailVerification?: boolean;
  error?: string;
}

export interface SignOutResult {
  success: boolean;
  error?: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  authenticate(email: string, password: string): Promise<AuthResult>;
  create(userData: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<CreateUserResult>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(userId: string, updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; user?: User; error?: string; }>;
  deleteUser(userId: string): Promise<{ success: boolean; error?: string; }>;
  signOut(): Promise<SignOutResult>;
  clearCache(): Promise<void>;
}

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

export interface RefreshTokenResult {
  success: boolean;
  session?: any; // Supabase Session type
  accessToken?: string;
  error?: string;
  isNetworkError?: boolean;
}

export interface RequestResetResult {
  success: boolean;
  error?: string;
  isNetworkError?: boolean;
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
  isNetworkError?: boolean;
}

export interface SocialAuthResult {
  success: boolean;
  user?: User;
  session?: any;
  error?: string;
  isNetworkError?: boolean;
  requiresAdditionalInfo?: boolean;
  providerData?: {
    providerId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
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
  refreshToken(refreshToken: string): Promise<RefreshTokenResult>;
  requestPasswordReset(email: string): Promise<RequestResetResult>;
  resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult>;
  authenticateWithProvider(provider: string, options?: any): Promise<SocialAuthResult>;
  completeSocialAuth(provider: string, data: any): Promise<SocialAuthResult>;
  clearCache(): Promise<void>;
}

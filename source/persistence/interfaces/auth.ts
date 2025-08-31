// Auth-related interfaces and types for persistence layer

// Event emitter interfaces
export interface AuthEventCallback {
  (event: string, data?: unknown): void;
}

export interface Unsubscribe {
  (): void;
}

export interface IAuthEventEmitter {
  subscribe(event: string, callback: AuthEventCallback): Unsubscribe;
  emit(event: string, data?: unknown): void;
  unsubscribeAll(): void;
}

// User repository interfaces
export interface CreateUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UpdateUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface DeleteUserResult {
  success: boolean;
  error?: string;
}

export interface GetUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface IUserRepository {
  create(user: Partial<User>): Promise<CreateUserResult>;
  update(id: string, updates: Partial<User>): Promise<UpdateUserResult>;
  delete(id: string): Promise<DeleteUserResult>;
  getById(id: string): Promise<GetUserResult>;
  getByEmail(email: string): Promise<GetUserResult>;
}

// User entity
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly displayName: string = '',
    public readonly avatarUrl: string | null = null,
    public readonly permissions: string[] = ['user'],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}

// User storage types
export interface UserStorage {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// Secure storage adapter interface
export interface SecureStorageOptions {
  requireAuthentication?: boolean;
  accessGroup?: string;
  keychainService?: string;
}

// Social auth adapter interfaces
export interface SocialAuthOptions {
  redirectUrl?: string;
  scopes?: string[];
}

export interface SocialAuthAdapterResult {
  success: boolean;
  user?: User;
  session?: SupabaseSession;
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

// Supabase auth adapter interfaces
export interface SupabaseAuthResult {
  success: boolean;
  user?: SupabaseUser;
  session?: SupabaseSession;
  data?: { user: SupabaseUser; session: SupabaseSession };
  error?: string;
  isNetworkError?: boolean;
}

export interface SupabaseSignUpResult {
  success: boolean;
  user?: SupabaseUser;
  data?: { user: SupabaseUser; session?: SupabaseSession };
  requiresEmailVerification?: boolean;
  error?: string;
}

// Supabase user and session types
export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  aud?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: SupabaseUser;
}

export interface SocialAuthData {
  provider: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Record<string, unknown>;
}

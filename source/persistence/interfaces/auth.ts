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
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// User mapper interface
export interface IUserMapper {
  toEntity(dbUser: unknown): User;
  toDatabase(user: User): unknown;
}

// Secure storage adapter interface
export interface SecureStorageOptions {
  accessible?: string;
  accessControl?: string;
  authenticationPrompt?: string;
}

export interface ISecureStorageAdapter {
  set(key: string, value: string, options?: SecureStorageOptions): Promise<void>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Social auth adapter interfaces
export interface SocialAuthOptions {
  provider: 'google' | 'apple' | 'facebook';
  redirectTo?: string;
}

export interface SocialAuthAdapterResult {
  success: boolean;
  user?: User;
  session?: unknown;
  error?: string;
}

export interface ISocialAuthAdapter {
  signIn(options: SocialAuthOptions): Promise<SocialAuthAdapterResult>;
  signOut(): Promise<{ success: boolean; error?: string }>;
}

// Supabase auth adapter interfaces
export interface SupabaseAuthResult {
  success: boolean;
  user?: User;
  session?: unknown;
  error?: string;
}

export interface SupabaseSignUpResult {
  success: boolean;
  user?: User;
  session?: unknown;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export interface ISupabaseAuthAdapter {
  signUp(email: string, password: string): Promise<SupabaseSignUpResult>;
  signIn(email: string, password: string): Promise<SupabaseAuthResult>;
  signOut(): Promise<{ success: boolean; error?: string }>;
  resetPassword(email: string): Promise<{ success: boolean; error?: string }>;
  updatePassword(password: string): Promise<{ success: boolean; error?: string }>;
  getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }>;
}

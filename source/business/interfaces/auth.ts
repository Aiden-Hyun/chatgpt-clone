/**
 * Authentication Business Layer Interfaces and Types
 * All auth-related interfaces, entities, and types
 */


// ============================================================================
// USER ENTITY - Core user domain object
// ============================================================================

/**
 * User entity representing an authenticated user in the system
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly avatarUrl: string | null,
    public readonly permissions: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  canAccessFeature(feature: string): boolean {
    // Business rules for feature access
    const featurePermissions: Record<string, string[]> = {
      'chat': ['user', 'admin'],
      'admin': ['admin'],
      'premium': ['premium', 'admin'],
      'search': ['user', 'premium', 'admin'],
      'image_generation': ['premium', 'admin']
    };
    
    const requiredPermissions = featurePermissions[feature] || [];
    return requiredPermissions.some((perm: string) => this.hasPermission(perm));
  }

  isAdmin(): boolean {
    return this.hasPermission('admin');
  }

  isPremium(): boolean {
    return this.hasPermission('premium') || this.hasPermission('admin');
  }

  getDisplayName(): string {
    return this.displayName || this.email.split('@')[0];
  }

  getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  canEditProfile(): boolean {
    return this.hasPermission('user');
  }

  canDeleteAccount(): boolean {
    return this.hasPermission('user');
  }
}

/**
 * Profile update result
 */
export interface UpdateProfileResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * User profile data
 */
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  updatedAt: Date;
}

/**
 * Get user profile parameters
 */
export interface GetUserProfileParams {
  userId: string;
}

/**
 * Get user profile result
 */
export interface GetUserProfileResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

/**
 * Update user profile parameters
 */
export interface UpdateUserProfileParams {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Update user profile result
 */
export interface UpdateUserProfileResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

// ============================================================================
// AUTH REPOSITORY INTERFACE - Data access abstraction
// ============================================================================

/**
 * User repository interface for authentication operations
 * Abstracts data access for user-related operations
 */
export interface IUserRepository {
  /**
   * Find user by email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by ID
   */
  findById(userId: string): Promise<User | null>;

  /**
   * Authenticate user with email and password
   */
  authenticate(email: string, password: string): Promise<AuthResult>;

  /**
   * Create a new user account
   */
  create(userData: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<CreateUserResult>;

  /**
   * Get currently authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Update user profile information
   */
  updateProfile(userId: string, updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<UpdateProfileResult>;

  /**
   * Get user profile information
   */
  getProfile(userId: string): Promise<GetUserProfileResult>;

  /**
   * Delete user account
   */
  deleteUser(userId: string): Promise<DeleteUserResult>;

  /**
   * Sign out current user
   */
  signOut(): Promise<SignOutResult>;

  /**
   * Refresh authentication token
   */
  refreshToken(refreshToken: string): Promise<RefreshTokenResult>;

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Promise<RequestResetResult>;

  /**
   * Complete password reset
   */
  resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult>;

  /**
   * Authenticate with social provider
   */
  authenticateWithProvider(provider: string, options?: any): Promise<SocialAuthResult>;

  /**
   * Complete social authentication flow
   */
  completeSocialAuth(provider: string, data: any): Promise<SocialAuthResult>;

  /**
   * Clear cached user data
   */
  clearCache(): Promise<void>;
}

// ============================================================================
// AUTH EVENT EMITTER - Authentication event handling
// ============================================================================

/**
 * Authentication events
 */
export enum AuthEvent {
  SIGN_IN = 'auth_sign_in',
  SIGN_OUT = 'auth_sign_out',
  TOKEN_REFRESH = 'auth_token_refresh',
  SESSION_EXPIRED = 'auth_session_expired',
  USER_UPDATED = 'auth_user_updated',
  PASSWORD_RESET_REQUESTED = 'auth_password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'auth_password_reset_completed',
  SOCIAL_AUTH_STARTED = 'auth_social_started',
  SOCIAL_AUTH_COMPLETED = 'auth_social_completed'
}

/**
 * Authentication event emitter interface
 */
export interface IAuthEventEmitter {
  /**
   * Emit an authentication event
   */
  emit(event: AuthEvent, data: AuthEventData): void;

  /**
   * Subscribe to authentication events
   */
  on(event: AuthEvent, handler: (data: AuthEventData) => void): void;

  /**
   * Unsubscribe from authentication events
   */
  off(event: AuthEvent, handler: (data: AuthEventData) => void): void;

  /**
   * Subscribe to authentication events (once)
   */
  once(event: AuthEvent, handler: (data: AuthEventData) => void): void;
}

// ============================================================================
// AUTH PERMISSIONS - Authorization types
// ============================================================================

/**
 * System permissions
 */
export enum Permission {
  USER = 'user',
  ADMIN = 'admin',
  PREMIUM = 'premium',
  MODERATOR = 'moderator'
}

/**
 * Feature access levels
 */
export enum FeatureAccess {
  PUBLIC = 'public',
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

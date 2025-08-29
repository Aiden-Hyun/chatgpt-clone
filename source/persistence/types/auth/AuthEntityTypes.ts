/**
 * Auth Entity Types
 * 
 * Database entity types for authentication.
 */

/**
 * User database entity
 */
export interface UserEntity {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Session database entity
 */
export interface SessionEntity {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
  scope?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Auth provider database entity
 */
export interface AuthProviderEntity {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  provider_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Password reset database entity
 */
export interface PasswordResetEntity {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

/**
 * User preferences database entity
 */
export interface UserPreferencesEntity {
  id: string;
  user_id: string;
  theme_mode: string;
  theme_style: string;
  language: string;
  notifications_enabled: boolean;
  preferences_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

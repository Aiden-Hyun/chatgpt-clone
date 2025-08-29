/**
 * Use Case Business Layer Interfaces
 * All use case parameter and result interfaces
 */

import { User } from './auth';
import { IUserSession } from './shared';

// ============================================================================
// CHAT USE CASE INTERFACES
// ============================================================================

// Create Room Use Case
export interface CreateRoomParams {
  name?: string;
  model: string;
  session: IUserSession;
}

// Update Room Use Case
export interface UpdateRoomParams {
  roomId: string;
  name?: string;
  model?: string;
  session: IUserSession;
}

// Delete Room Use Case
export interface DeleteRoomParams {
  roomId: string;
  session: IUserSession;
}

// Send Message Use Case
export interface SendMessageParams {
  content: string;
  roomId: string;
  session: IUserSession;
}

// Receive Message Use Case
export interface ReceiveMessageParams {
  content: string;
  roomId: string;
  session: IUserSession;
}

// Edit Message Use Case
export interface EditMessageParams {
  messageId: string;
  newContent: string;
  session: IUserSession;
}

// Delete Message Use Case
export interface DeleteMessageParams {
  messageId: string;
  session: IUserSession;
}

// Copy Message Use Case
export interface CopyMessageParams {
  messageId: string;
  session: IUserSession;
}

// Resend Message Use Case
export interface ResendMessageParams {
  messageId: string;
  session: IUserSession;
}

// Regenerate Assistant Message Use Case
export interface RegenerateAssistantParams {
  messageId: string;
  session: IUserSession;
}

// List Rooms Use Case
export interface ListRoomsParams {
  session: IUserSession;
}

// ============================================================================
// AUTH USE CASE INTERFACES
// ============================================================================

// Auth Provider Type
export type AuthProvider = 'google' | 'apple' | 'github' | 'facebook';

// Sign In Use Case
export interface SignInRequest {
  email: string;
  password: string;
}

// Sign Up Use Case
export interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
}

// Sign Out Use Case
export interface SignOutRequest {
  session: IUserSession;
}

// Social Auth Use Case
export interface SocialAuthRequest {
  provider: AuthProvider;
  token?: string;
  additionalData?: Record<string, unknown>;
}

// Refresh Token Use Case
export interface RefreshTokenRequest {
  refreshToken: string;
  session: IUserSession;
}

// Request Password Reset Use Case
export interface RequestPasswordResetRequest {
  email: string;
}

// Reset Password Use Case
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Check Authorization Use Case
export interface CheckAuthorizationRequest {
  userId: string;
  resource: string;
  action: string;
}

// Monitor Auth State Use Case
export interface AuthStateChange {
  user?: User;
  session?: IUserSession;
  isAuthenticated: boolean;
  timestamp: Date;
}

// ============================================================================
// SESSION USE CASE INTERFACES
// ============================================================================

// Get Session Use Case
export interface GetSessionRequest {
  userId?: string;
}

// Refresh Session Use Case
export interface RefreshSessionRequest {
  session: IUserSession;
}

// Validate Session Use Case
export interface ValidateSessionRequest {
  session: IUserSession;
}

// Update Session Activity Use Case
export interface UpdateSessionActivityResult {
  success: boolean;
  error?: string;
}

// Auto Logout Use Case
export interface AutoLogoutRequest {
  session: IUserSession;
  inactivityThreshold: number;
}

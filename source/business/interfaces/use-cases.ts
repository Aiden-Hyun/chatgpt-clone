/**
 * Use Case Business Layer Interfaces
 * All use case parameter and result interfaces
 */

import { IUserSession } from './shared';
import { ChatRoomEntity, MessageEntity } from './chat';
import { User } from './auth';

// ============================================================================
// CHAT USE CASE INTERFACES
// ============================================================================

// Create Room Use Case
export interface CreateRoomParams {
  name?: string;
  model: string;
  session: IUserSession;
}

export interface CreateRoomResult {
  success: boolean;
  room?: ChatRoomEntity;
  error?: string;
}

// Update Room Use Case
export interface UpdateRoomParams {
  roomId: string;
  name?: string;
  model?: string;
  session: IUserSession;
}

export interface UpdateRoomResult {
  success: boolean;
  room?: ChatRoomEntity;
  error?: string;
}

// Delete Room Use Case
export interface DeleteRoomParams {
  roomId: string;
  session: IUserSession;
}

export interface DeleteRoomResult {
  success: boolean;
  error?: string;
}

// Send Message Use Case
export interface SendMessageParams {
  content: string;
  roomId: string;
  session: IUserSession;
}

export interface SendMessageResult {
  success: boolean;
  userMessage?: MessageEntity;
  assistantMessage?: MessageEntity;
  error?: string;
}

// Receive Message Use Case
export interface ReceiveMessageParams {
  content: string;
  roomId: string;
  session: IUserSession;
}

export interface ReceiveMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

// Edit Message Use Case
export interface EditMessageParams {
  messageId: string;
  newContent: string;
  session: IUserSession;
}

export interface EditMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

// Delete Message Use Case
export interface DeleteMessageParams {
  messageId: string;
  session: IUserSession;
}

export interface DeleteMessageResult {
  success: boolean;
  error?: string;
}

// Copy Message Use Case
export interface CopyMessageParams {
  messageId: string;
  session: IUserSession;
}

export interface CopyMessageResult {
  success: boolean;
  error?: string;
}

// Resend Message Use Case
export interface ResendMessageParams {
  messageId: string;
  session: IUserSession;
}

export interface ResendMessageResult {
  success: boolean;
  newMessage?: MessageEntity;
  error?: string;
}

// Regenerate Assistant Use Case
export interface RegenerateAssistantParams {
  messageId: string;
  session: IUserSession;
}

export interface RegenerateAssistantResult {
  success: boolean;
  newMessage?: MessageEntity;
  error?: string;
}

// List Rooms Use Case
export interface ListRoomsParams {
  session: IUserSession;
}

export interface ListRoomsResult {
  success: boolean;
  rooms?: ChatRoomEntity[];
  error?: string;
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

export interface SignInResult {
  success: boolean;
  user?: User;
  session?: IUserSession;
  error?: string;
}

// Sign Up Use Case
export interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface SignUpResult {
  success: boolean;
  user?: User;
  session?: IUserSession;
  error?: string;
}

// Sign Out Use Case
export interface SignOutRequest {
  session: IUserSession;
}

export interface SignOutResult {
  success: boolean;
  error?: string;
}

// Social Auth Use Case
export interface SocialAuthRequest {
  provider: AuthProvider;
  token?: string;
  additionalData?: Record<string, any>;
}

export interface SocialAuthResult {
  success: boolean;
  user?: User;
  session?: IUserSession;
  error?: string;
  requiresAdditionalInfo?: boolean;
}

// Refresh Token Use Case
export interface RefreshTokenRequest {
  refreshToken: string;
  session: IUserSession;
}

export interface RefreshTokenResult {
  success: boolean;
  session?: IUserSession;
  error?: string;
}

// Request Password Reset Use Case
export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResult {
  success: boolean;
  error?: string;
}

// Reset Password Use Case
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

// Check Authorization Use Case
export interface CheckAuthorizationRequest {
  userId: string;
  resource: string;
  action: string;
}

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
}

// Monitor Auth State Use Case
export interface AuthStateChange {
  user?: User;
  session?: IUserSession;
  isAuthenticated: boolean;
  timestamp: Date;
}

export interface MonitorAuthStateResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// SESSION USE CASE INTERFACES
// ============================================================================

// Get Session Use Case
export interface GetSessionRequest {
  userId?: string;
}

export interface GetSessionResult {
  success: boolean;
  session?: IUserSession;
  error?: string;
}

// Refresh Session Use Case
export interface RefreshSessionRequest {
  session: IUserSession;
}

export interface RefreshSessionResult {
  success: boolean;
  session?: IUserSession;
  error?: string;
}

// Validate Session Use Case
export interface ValidateSessionRequest {
  session: IUserSession;
}

export interface SessionValidationResult {
  isValid: boolean;
  error?: string;
  isExpired?: boolean;
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

export interface AutoLogoutResult {
  success: boolean;
  loggedOut: boolean;
  error?: string;
}

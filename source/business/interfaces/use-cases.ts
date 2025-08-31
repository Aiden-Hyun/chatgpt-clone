/**
 * Use Case Business Layer Interfaces
 * All use case parameter and result interfaces
 */

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
// GET SESSION USE CASE INTERFACES
// ============================================================================

// Get Session Use Case
export interface GetSessionRequest {
  userId?: string;
}

// ============================================================================
// THEME USE CASE INTERFACES
// ============================================================================

// ============================================================================
// SETTINGS USE CASE INTERFACES
// ============================================================================

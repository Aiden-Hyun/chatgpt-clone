/**
 * View Model Business Layer Interfaces
 * All view model state and action interfaces
 */

import { ChatRoomEntity, MessageEntity } from './chat';

// ============================================================================
// CHAT VIEW MODEL INTERFACES
// ============================================================================

/**
 * Chat state interface for chat view model
 */
export interface ChatState {
  messages: MessageEntity[];
  currentRoom: ChatRoomEntity | null;
  isLoading: boolean;
  error: string | null;
  inputValue: string;
  pendingByMessageId: Record<string, boolean>;
}

/**
 * Chat actions interface for chat view model
 */
export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  copyMessage: (messageId: string) => Promise<void>;
  resendMessage: (messageId: string) => Promise<void>;
  regenerateAssistant: (messageId: string) => Promise<void>;
  setInputValue: (value: string) => void;
  clearError: () => void;
}

/**
 * Chat room state interface for chat room view model
 */
export interface ChatRoomState {
  rooms: ChatRoomEntity[];
  currentRoom: ChatRoomEntity | null;
  isLoading: boolean;
  error: string | null;
  loading: boolean;
  creatingRoom: boolean;
  updatingRoom: boolean;
  deletingRoom: boolean;
}

/**
 * Chat room actions interface for chat room view model
 */
export interface ChatRoomActions {
  createRoom: (model: string, name?: string) => Promise<{ success: boolean; room?: ChatRoomEntity; error?: string }>;
  updateRoom: (roomId: string, updates: { name?: string; model?: string }) => Promise<{ success: boolean; room?: ChatRoomEntity; error?: string }>;
  deleteRoom: (roomId: string) => Promise<{ success: boolean; error?: string }>;
  selectRoom: (roomId: string) => void;
  loadRooms: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// AUTH VIEW MODEL INTERFACES
// ============================================================================

/**
 * Sign in view model state
 */
export interface SignInState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Sign in view model actions
 */
export interface SignInActions {
  signIn: (email: string, password: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Sign up view model state
 */
export interface SignUpState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Sign up view model actions
 */
export interface SignUpActions {
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Sign out view model state
 */
export interface SignOutState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Sign out view model actions
 */
export interface SignOutActions {
  signOut: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// SESSION VIEW MODEL INTERFACES
// ============================================================================

/**
 * Session view model state
 */
export interface SessionState {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
}

/**
 * Session view model actions
 */
export interface SessionActions {
  validateSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateActivity: () => Promise<void>;
  clearError: () => void;
}

/**
 * Session view model dependencies interface
 */
export interface ISessionViewModelDependencies {
  getSessionUseCase: any; // GetSessionUseCase
  refreshSessionUseCase: any; // RefreshSessionUseCase
  validateSessionUseCase: any; // ValidateSessionUseCase
  updateActivityUseCase: any; // UpdateSessionActivityUseCase
}

// ============================================================================
// VIEW MODEL DEPENDENCIES INTERFACES
// ============================================================================

/**
 * Chat room view model dependencies interface
 */
export interface ChatRoomViewModelDependencies {
  createRoomUseCase: any; // CreateRoomUseCase
  updateRoomUseCase: any; // UpdateRoomUseCase
  deleteRoomUseCase: any; // DeleteRoomUseCase
  listRoomsUseCase: any; // ListRoomsUseCase
}

/**
 * Chat view model dependencies interface
 */
export interface ChatViewModelDependencies {
  sendMessageUseCase: any; // SendMessageUseCase
  receiveMessageUseCase: any; // ReceiveMessageUseCase
  deleteMessageUseCase: any; // DeleteMessageUseCase
  copyMessageUseCase: any; // CopyMessageUseCase
  editMessageUseCase: any; // EditMessageUseCase
  resendMessageUseCase: any; // ResendMessageUseCase
  regenerateAssistantUseCase: any; // RegenerateAssistantUseCase
  messageRepository: any; // IMessageRepository
  chatRoomRepository: any; // IChatRoomRepository
  getAccessToken: () => Promise<string | null>;
}

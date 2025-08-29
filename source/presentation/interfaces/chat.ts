/**
 * Chat Presentation Interfaces
 * 
 * All chat-related interfaces for the presentation layer.
 */

import { RefObject } from 'react';
import { TextInput } from 'react-native';
import { BaseComponentProps } from './shared';

// ============================================================================
// CHAT MESSAGE INTERFACES
// ============================================================================

/**
 * Chat message interface (referenced in components)
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  model?: string;
  state?: 'sending' | 'sent' | 'error' | 'regenerating';
  metadata?: Record<string, any>;
}

/**
 * Message display props (for UI rendering)
 */
export interface MessageDisplayProps {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isLoading?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

/**
 * Message item component props (extracted from MessageItem/index.tsx)
 */
export interface MessageItemProps extends BaseComponentProps {
  message: ChatMessage;
  index: number;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
  onUserEditRegenerate?: (index: number, newText: string) => void;
  isLastInGroup?: boolean;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

// ============================================================================
// CHAT INPUT INTERFACES
// ============================================================================

/**
 * Chat input bar props (extracted from ChatInputBar/index.tsx)
 */
export interface ChatInputBarProps extends BaseComponentProps {
  input: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
  isTyping?: boolean;
  inputRef: RefObject<TextInput | null>;
  isSearchMode?: boolean;
  onSearchToggle?: () => void;
  selectedModel?: string;
}

/**
 * Chat input state
 */
export interface ChatInputState {
  message: string;
  isComposing: boolean;
  isSending: boolean;
  attachments: File[];
}

// ============================================================================
// CHAT ROOM INTERFACES
// ============================================================================

/**
 * Chat room interface (extracted from useChatRooms.ts)
 */
export interface ChatRoom {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  last_message?: {
    content: string;
    created_at: string;
  };
}

/**
 * Chat room display props
 */
export interface ChatRoomDisplayProps {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isActive: boolean;
}

/**
 * Create room button props (extracted from CreateRoomButton.tsx)
 */
export interface CreateRoomButtonProps extends BaseComponentProps {
  onCreateRoom?: () => void;
  isLoading?: boolean;
}

/**
 * Room list props (extracted from RoomList.tsx)
 */
export interface RoomListProps extends BaseComponentProps {
  rooms: ChatRoom[];
  activeRoomId?: string;
  onRoomSelect: (roomId: string) => void;
  onRoomDelete?: (roomId: string) => void;
  isLoading?: boolean;
}

// ============================================================================
// MODEL SELECTION INTERFACES
// ============================================================================

/**
 * Model option interface
 */
export interface ModelOption {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  capabilities: string[];
  isAvailable: boolean;
}

/**
 * Model selector props
 */
export interface ModelSelectorProps extends BaseComponentProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  availableModels: ModelOption[];
  isLoading?: boolean;
}

// ============================================================================
// CHAT INTERFACE INTERFACES
// ============================================================================

/**
 * Chat interface state
 */
export interface ChatInterfaceState {
  messages: MessageDisplayProps[];
  isLoading: boolean;
  isGenerating: boolean;
  selectedModel: string;
  inputState: ChatInputState;
}

/**
 * Chat interface props
 */
export interface ChatInterfaceProps extends BaseComponentProps {
  roomId?: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  isLoading?: boolean;
}

// ============================================================================
// CHAT ACTION INTERFACES
// ============================================================================

/**
 * Message action types
 */
export type MessageAction = 'copy' | 'edit' | 'delete' | 'regenerate' | 'like' | 'dislike';

/**
 * Chat theme customization
 */
export interface ChatThemeCustomization {
  messageSpacing: number;
  bubbleRadius: number;
  showAvatars: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
}

/**
 * Test chat interface props
 */
export interface TestChatInterfaceProps extends BaseComponentProps {
  userId: string;
}

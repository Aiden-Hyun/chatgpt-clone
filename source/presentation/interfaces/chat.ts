/**
 * Chat Presentation Interfaces
 * 
 * All chat-related interfaces for the presentation layer.
 */

import { RefObject } from 'react';
import { TextInput } from 'react-native';

import { BaseComponentProps } from './shared';

// ============================================================================
// MODEL TYPES - AI model configuration (from business layer)
// ============================================================================

/**
 * Model provider types
 */
export type ModelProvider = 'openai' | 'anthropic' | 'perplexity';

/**
 * Model capabilities interface
 */
export interface ModelCapabilities {
  chat: boolean;
  image: boolean;
  search: boolean;
  vision: boolean;
  code: boolean;
  analysis: boolean;
}

/**
 * Model information interface
 */
export interface ModelInfo {
  label: string;
  value: string;
  provider: ModelProvider;
  capabilities: ModelCapabilities;
  description?: string;
  tokenParameter?: 'max_tokens' | 'max_completion_tokens';
  supportsCustomTemperature?: boolean;
  defaultTemperature?: number;
}

/**
 * Type for model values
 */
export type ModelValue = string;

// ============================================================================
// MESSAGE ENTITY TYPES - Business layer message entities
// ============================================================================

/**
 * Message role enumeration
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

/**
 * Message metadata interface
 */
export interface MessageMetadata {
  model?: string;
  tokens?: number;
  processingTime?: number;
  error?: string;
  isEdited?: boolean;
  editedAt?: Date;
  replyToMessageId?: string;
  supersededByMessageId?: string;
}

/**
 * Message entity interface (from business layer)
 */
export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  roomId: string;
  userId?: string;
  isDeleted: boolean;
  metadata?: MessageMetadata;
}

/**
 * Message entity with business logic
 */
export class MessageEntity implements Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  roomId: string;
  userId?: string;
  isDeleted: boolean;
  metadata?: MessageMetadata;

  constructor(params: {
    id: string;
    content: string;
    role: MessageRole;
    roomId: string;
    userId?: string;
    timestamp?: Date;
    isDeleted?: boolean;
    metadata?: MessageMetadata;
  }) {
    this.id = params.id;
    this.content = params.content;
    this.role = params.role;
    this.roomId = params.roomId;
    this.userId = params.userId;
    this.timestamp = params.timestamp || new Date();
    this.isDeleted = params.isDeleted || false;
    this.metadata = params.metadata;
  }

  // Business methods
  isUserMessage(): boolean {
    return this.role === MessageRole.USER;
  }

  isAssistantMessage(): boolean {
    return this.role === MessageRole.ASSISTANT;
  }

  isSystemMessage(): boolean {
    return this.role === MessageRole.SYSTEM;
  }

  markAsDeleted(): void {
    this.isDeleted = true;
  }

  restore(): void {
    this.isDeleted = false;
  }

  updateContent(newContent: string): void {
    this.content = newContent;
    this.timestamp = new Date();
  }

  addMetadata(metadata: Partial<MessageMetadata>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  getDisplayContent(): string {
    return this.isDeleted ? '[Message deleted]' : this.content;
  }

  canBeDeleted(): boolean {
    return !this.isSystemMessage() && !this.isDeleted;
  }

  canBeCopied(): boolean {
    return !this.isDeleted && this.content.length > 0;
  }

  editContent(newContent: string): void {
    this.content = newContent;
    this.metadata = {
      ...this.metadata,
      isEdited: true,
      editedAt: new Date()
    };
  }

  canBeEdited(userId: string): boolean {
    return this.isUserMessage() && this.userId === userId && !this.isDeleted;
  }

  markAsSuperseded(supersededByMessageId: string): void {
    this.metadata = {
      ...this.metadata,
      supersededByMessageId
    };
  }

  linkToUserMessage(replyToMessageId: string): void {
    this.metadata = {
      ...this.metadata,
      replyToMessageId
    };
  }

  isEdited(): boolean {
    return this.metadata?.isEdited === true;
  }

  isSuperseded(): boolean {
    return !!this.metadata?.supersededByMessageId;
  }
}

// ============================================================================
// CHAT ROOM ENTITY TYPES - Business layer chat room entities
// ============================================================================

/**
 * Chat room entity interface (from business layer)
 */
export interface ChatRoomEntity {
  id: string;
  name: string;
  model: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  messageCount: number;
  lastMessage?: string;
  lastActivity?: Date;
}

/**
 * Chat room entity with business logic
 */
export class ChatRoom implements ChatRoomEntity {
  id: string;
  name: string;
  model: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  messageCount: number;
  lastMessage?: string;
  lastActivity?: Date;

  constructor(params: {
    id: string;
    name: string;
    model: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
    messageCount?: number;
    lastMessage?: string;
    lastActivity?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.model = params.model;
    this.userId = params.userId;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
    this.isActive = params.isActive ?? true;
    this.messageCount = params.messageCount || 0;
    this.lastMessage = params.lastMessage;
    this.lastActivity = params.lastActivity;
  }

  // Business methods
  updateLastMessage(messageId: string, timestamp: Date): void {
    this.lastMessage = messageId;
    this.lastActivity = timestamp;
    this.updatedAt = new Date();
    this.messageCount++;
  }

  incrementMessageCount(): void {
    this.messageCount++;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  updateName(newName: string): void {
    this.name = newName;
    this.updatedAt = new Date();
  }

  getDisplayName(): string {
    return this.name || 'New Chat';
  }

  isRecent(): boolean {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.updatedAt > oneDayAgo;
  }
}

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
 * Assistant message bar props
 */
export interface AssistantMessageBarProps {
  onRegenerate?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onAudio?: () => void;
  // Like/dislike state
  isLiked?: boolean;
  isDisliked?: boolean;
}

/**
 * Chat header props
 */
export interface ChatHeaderProps {
  onLogout: () => void;
  onSettings: () => void;
  onBack: () => void;
  onNewChat: () => void;
  onChatSelect: (roomId: string) => void;
  selectedChatId?: string;
  // Model selection props for chat rooms
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showModelSelection?: boolean;
}

/**
 * Chat input props
 */
export interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
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
 * Model selector component props
 */
export interface ModelSelectorComponentProps {
  selectedModel: string;
  onModelChange: (model: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * Room management props
 */
export interface RoomManagementProps {
  onRoomSelect?: (room: ChatRoom) => void;
  onRoomCreated?: (room: ChatRoom) => void;
  onRoomDeleted?: (roomId: string) => void;
  style?: Record<string, unknown>;
}

/**
 * Sidebar props
 */
export interface SidebarProps {
  onNewChat?: () => void;
  onChatSelect?: (roomId: string) => void;
  onSettings?: () => void;
}

// ============================================================================
// CHAT INTERFACE INTERFACES
// ============================================================================

/**
 * Chat interface component props
 */
export interface ChatInterfaceComponentProps {
  roomId: string | number;
  initialModel?: string;
  className?: string;
  showHeader?: boolean;
  selectedModel?: string;
  onChangeModel?: (model: string) => void;
  onChatStateChange?: (state: {
    input: string;
    handleInputChange: (text: string) => void;
    sendMessage: () => void;
    sending: boolean;
    isTyping: boolean;
    isSearchMode: boolean;
    onSearchToggle: () => void;
  }) => void;
}

/**
 * Code block props
 */
export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

/**
 * Code styler props
 */
export interface CodeStylerProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

/**
 * Error message props
 */
export interface ErrorMessageProps {
  message: ChatMessage;
  onRetry: () => void;
  style?: Record<string, unknown>;
}

/**
 * Loading message props
 */
export interface LoadingMessageProps {
  style?: Record<string, unknown>;
}

/**
 * Markdown renderer props
 */
export interface MarkdownRendererProps {
  children: string;
  isAnimating?: boolean;
}

/**
 * Assistant message props
 */
export interface IAssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
}

/**
 * System message props
 */
export interface SystemMessageProps {
  message: ChatMessage;
}

/**
 * User message props
 */
export interface IUserMessageProps {
  message: ChatMessage;
  isLastInGroup?: boolean;
  onSendEdited?: (newText: string) => void;
}

/**
 * Message list props
 */
export interface MessageListProps {
  messages: ChatMessage[];
  // ✅ STATE MACHINE: Remove legacy loading flag - derive from message states
  regeneratingIndex: number | null;
  onRegenerate: (index: number) => void;
  showWelcomeText: boolean;
}

/**
 * Model capability icons props
 */
export interface ModelCapabilityIconsProps {
  capabilities: ModelCapabilities;
  size?: number;
  showLabels?: boolean;
  containerStyle?: Record<string, unknown>;
}

// ============================================================================
// CHAT ACTION INTERFACES
// ============================================================================

/**
 * Test chat interface props
 */
export interface TestChatInterfaceProps extends BaseComponentProps {
  userId: string;
}

// ============================================================================
// MODEL HELPER FUNCTIONS
// ============================================================================

/**
 * Available models constant (to be populated from constants)
 */
export const AVAILABLE_MODELS: ModelInfo[] = [];

/**
 * Default model
 */
export const DEFAULT_MODEL: ModelValue = 'gpt-3.5-turbo';

/**
 * Get model info by value
 */
export function getModelInfo(value: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find(model => model.value === value);
}

/**
 * Validate model capabilities
 */
export function validateModelCapabilities(
  model: string, 
  requiredCapabilities: Partial<ModelCapabilities>
): boolean {
  const modelInfo = getModelInfo(model);
  if (!modelInfo) return false;

  return Object.entries(requiredCapabilities).every(([capability, required]) => {
    if (!required) return true;
    return modelInfo.capabilities[capability as keyof ModelCapabilities];
  });
}

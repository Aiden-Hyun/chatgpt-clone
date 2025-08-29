/**
 * Chat Business Layer Interfaces and Types
 * All chat-related interfaces, entities, and types
 */

import { IUserSession } from './shared';

// ============================================================================
// MESSAGE ENTITY - Core message domain object
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
 * Message interface
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
// CHAT ROOM ENTITY - Chat room domain object
// ============================================================================

/**
 * Chat room interface
 */
export interface ChatRoom {
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
export class ChatRoomEntity implements ChatRoom {
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
// MODEL TYPES - AI model configuration
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
// REPOSITORY INTERFACES - Data access abstractions
// ============================================================================

/**
 * Chat room repository result types
 */
export interface CreateRoomResult {
  success: boolean;
  room?: ChatRoomEntity;
  error?: string;
}

export interface UpdateRoomResult {
  success: boolean;
  room?: ChatRoomEntity;
  error?: string;
}

export interface DeleteRoomResult {
  success: boolean;
  error?: string;
}

/**
 * Chat room repository interface
 */
export interface IChatRoomRepository {
  create(model: string, session: IUserSession, name?: string): Promise<CreateRoomResult>;
  update(room: ChatRoomEntity, session: IUserSession): Promise<UpdateRoomResult>;
  getById(roomId: string, session: IUserSession): Promise<ChatRoomEntity | null>;
  listByUserId(userId: string, session: IUserSession): Promise<ChatRoomEntity[]>;
  delete(roomId: string, session: IUserSession): Promise<DeleteRoomResult>;
}

/**
 * Message repository result types
 */
export interface SaveMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

export interface DeleteMessageResult {
  success: boolean;
  error?: string;
}

/**
 * Message repository interface
 */
export interface IMessageRepository {
  save(message: MessageEntity, session: IUserSession): Promise<SaveMessageResult>;
  update(message: MessageEntity, session: IUserSession): Promise<SaveMessageResult>;
  getById(messageId: string, session: IUserSession): Promise<MessageEntity | null>;
  getByRoomId(roomId: string, session: IUserSession): Promise<MessageEntity[]>;
  getRecentByRoomId(roomId: string, limit: number, session: IUserSession): Promise<MessageEntity[]>;
  delete(messageId: string, session: IUserSession): Promise<DeleteMessageResult>;
}

// ============================================================================
// AI PROVIDER INTERFACE - AI service abstraction
// ============================================================================

/**
 * AI message parameters
 */
export interface AIMessageParams {
  content: string;
  roomId: string;
  model?: string;
  accessToken: string;
}

/**
 * AI response interface
 */
export interface AIResponse {
  success: boolean;
  content?: string;
  tokens?: number;
  processingTime?: number;
  error?: string;
}

/**
 * AI provider interface
 */
export interface IAIProvider {
  sendMessage(params: AIMessageParams): Promise<AIResponse>;
}

// ============================================================================
// CLIPBOARD ADAPTER INTERFACE - Clipboard operations
// ============================================================================

/**
 * Clipboard operation result
 */
export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Clipboard get result (extends ClipboardResult)
 */
export interface ClipboardGetResult extends ClipboardResult {
  text?: string;
}

/**
 * Clipboard adapter interface
 */
export interface IClipboardAdapter {
  copyToClipboard(text: string): Promise<ClipboardResult>;
  getFromClipboard(): Promise<ClipboardGetResult>;
  hasString(): Promise<boolean>;
}

// ============================================================================
// CHAT OPERATION TYPES - Business operation results
// ============================================================================

/**
 * Send message operation result
 */
export interface SendMessageResult {
  success: boolean;
  userMessage?: MessageEntity;
  assistantMessage?: MessageEntity;
  error?: string;
}

/**
 * Copy message operation result
 */
export interface CopyMessageResult {
  success: boolean;
  error?: string;
}

/**
 * Edit message operation result
 */
export interface EditMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

/**
 * Regenerate assistant response result
 */
export interface RegenerateAssistantResult {
  success: boolean;
  newMessage?: MessageEntity;
  error?: string;
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

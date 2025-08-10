/**
 * Message-related types and interfaces for the concurrent chat system.
 * Single source of truth for all message types, roles, statuses, and metadata.
 */

/**
 * Message role types
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message status types
 */
export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Represents a message in the concurrent chat system
 */
export interface ConcurrentMessage {
  id: string;
  content: string;
  role: MessageRole;
  status: MessageStatus;
  timestamp: number;
  roomId?: number;
  model?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Legacy chat message interface (for compatibility with existing chat components)
 * Re-exported from src/features/chat/types for centralized message type management
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Message metadata types for various use cases
 */
export interface MessageMetadata {
  // Context for message processing
  context?: ConcurrentMessage[];
  
  // Editing-related metadata
  originalContent?: string;
  editHistory?: Array<{
    content: string;
    timestamp: number;
    reason?: string;
  }>;
  
  // Regeneration-related metadata
  regenerationCount?: number;
  regenerationContext?: ConcurrentMessage[];
  
  // Model-related metadata
  modelUsed?: string;
  modelParameters?: Record<string, any>;
  
  // Streaming-related metadata
  isStreaming?: boolean;
  streamChunks?: string[];
  
  // Animation-related metadata
  animationType?: string;
  animationDuration?: number;
  
  // Performance metadata
  processingTime?: number;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  
  // Error metadata
  errorCode?: string;
  errorDetails?: any;
  retryable?: boolean;
  
  // Generic extensibility
  [key: string]: any;
}

/**
 * Enhanced concurrent message with typed metadata
 */
export interface TypedConcurrentMessage extends Omit<ConcurrentMessage, 'metadata'> {
  metadata?: MessageMetadata;
}

/**
 * Message status constants for easy reference
 */
export const MESSAGE_STATUS = {
  PENDING: 'pending' as const,
  PROCESSING: 'processing' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const,
  CANCELLED: 'cancelled' as const,
} as const;

/**
 * Message role constants for easy reference
 */
export const MESSAGE_ROLE = {
  USER: 'user' as const,
  ASSISTANT: 'assistant' as const,
  SYSTEM: 'system' as const,
} as const;

/**
 * Type guards for message validation
 */
export function isValidMessageRole(role: string): role is MessageRole {
  return Object.values(MESSAGE_ROLE).includes(role as MessageRole);
}

export function isValidMessageStatus(status: string): status is MessageStatus {
  return Object.values(MESSAGE_STATUS).includes(status as MessageStatus);
}

export function isConcurrentMessage(obj: any): obj is ConcurrentMessage {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    isValidMessageRole(obj.role) &&
    isValidMessageStatus(obj.status) &&
    typeof obj.timestamp === 'number'
  );
}

export function isChatMessage(obj: any): obj is ChatMessage {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.content === 'string' &&
    (obj.role === 'user' || obj.role === 'assistant')
  );
}

/**
 * Factory functions for creating messages
 */
export function createConcurrentMessage(
  content: string,
  role: MessageRole = MESSAGE_ROLE.USER,
  options: Partial<ConcurrentMessage> = {}
): ConcurrentMessage {
  return {
    id: options.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    content,
    role,
    status: MESSAGE_STATUS.PENDING,
    timestamp: Date.now(),
    ...options,
  };
}

export function createChatMessage(
  content: string,
  role: 'user' | 'assistant' = 'user'
): ChatMessage {
  return {
    content,
    role,
  };
}

/**
 * Utility functions for message operations
 */
export function isProcessingMessage(message: ConcurrentMessage): boolean {
  return message.status === MESSAGE_STATUS.PROCESSING || message.status === MESSAGE_STATUS.PENDING;
}

export function isCompletedMessage(message: ConcurrentMessage): boolean {
  return message.status === MESSAGE_STATUS.COMPLETED;
}

export function isFailedMessage(message: ConcurrentMessage): boolean {
  return message.status === MESSAGE_STATUS.FAILED;
}

export function isUserMessage(message: ConcurrentMessage): boolean {
  return message.role === MESSAGE_ROLE.USER;
}

export function isAssistantMessage(message: ConcurrentMessage): boolean {
  return message.role === MESSAGE_ROLE.ASSISTANT;
}

export function isSystemMessage(message: ConcurrentMessage): boolean {
  return message.role === MESSAGE_ROLE.SYSTEM;
}

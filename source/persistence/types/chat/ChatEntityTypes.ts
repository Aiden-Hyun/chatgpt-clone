/**
 * Chat Entity Types
 * 
 * Database entity types for chat functionality.
 */

/**
 * Chat room database entity
 */
export interface ChatRoomEntity {
  id: string;
  user_id: string;
  title: string;
  model: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  message_count: number;
  metadata?: Record<string, unknown>;
}

/**
 * Message database entity
 */
export interface MessageEntity {
  id: string;
  room_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokens_used?: number;
  created_at: string;
  updated_at: string;
  parent_message_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Message attachment database entity
 */
export interface MessageAttachmentEntity {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

/**
 * Chat model configuration entity
 */
export interface ChatModelEntity {
  id: string;
  name: string;
  display_name: string;
  provider: string;
  max_tokens: number;
  supports_streaming: boolean;
  supports_functions: boolean;
  cost_per_token: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

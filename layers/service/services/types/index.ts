// src/features/chat/services/types/index.ts
import { ChatMessage } from '../../types';

// Re-export ChatMessage for services
export type { ChatMessage };

export interface AIApiRequest {
  roomId: number;
  messages: ChatMessage[];
  model: string;
  // Optional idempotency and control flags
  clientMessageId?: string;
  skipPersistence?: boolean;

}

export interface AIApiResponse {
  choices?: {
    message: {
      content: string;
      role: string;
    };
  }[];
  content?: string;
  model?: string;
  error?: any;
  // Search-specific fields
  citations?: any[];
  time_warning?: string;
} 
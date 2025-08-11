// src/features/chat/services/types/index.ts
import { ChatMessage } from '../../types';

// Re-export ChatMessage for services
export type { ChatMessage };

export interface AIApiRequest {
  roomId: number;
  messages: ChatMessage[];
  model: string;
}

export interface AIApiResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
  model?: string;
  error?: any;
} 
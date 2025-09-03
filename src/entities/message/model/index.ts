// src/entities/message/model/index.ts
import type { ChatMessage } from "./types";

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
  error?: string | { message: string; code?: string };
  // Search-specific fields
  citations?: {
    title?: string;
    url?: string;
    content?: string;
  }[];
  time_warning?: string;
}

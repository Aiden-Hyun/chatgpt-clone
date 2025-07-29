// src/features/chat/services/types/index.ts

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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
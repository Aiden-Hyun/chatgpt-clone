// src/features/chat/services/interfaces/IMessageService.ts
import { ChatMessage } from '../types';

export interface IMessageService {
  /**
   * Insert user and assistant messages into the database
   */
  insertMessages(args: {
    roomId: number;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    session: any; // Session type from Supabase
  }): Promise<void>;
  
  /**
   * Update an existing assistant message (for regeneration)
   */
  updateAssistantMessage(args: {
    roomId: number;
    newContent: string;
    originalContent: string;
    session: any; // Session type from Supabase
  }): Promise<void>;
  
  /**
   * Load messages for a specific room
   */
  loadMessages(roomId: number): Promise<ChatMessage[]>;
  
  /**
   * Delete messages for a room
   */
  deleteMessages(roomId: number): Promise<void>;
} 
// src/features/chat/services/interfaces/IMessageService.ts
import type { ChatMessage } from "@/entities/message";
import type { Session } from "@/entities/session";

export interface IMessageService {
  /**
   * Insert user and assistant messages into the database
   */
  insertMessages(args: {
    roomId: number;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    session: Session; // Session type from Supabase
  }): Promise<void>;

  /**
   * Update an existing assistant message (for regeneration)
   */
  updateAssistantMessage(args: {
    roomId: number;
    newContent: string;
    originalContent: string;
    session: Session; // Session type from Supabase
  }): Promise<void>;

  /**
   * Update assistant message by client_id (preferred when available)
   * Returns true if an update occurred, false if not found
   */
  updateAssistantMessageByClientId?(args: {
    roomId: number;
    messageId: string;
    newContent: string;
    session: Session;
  }): Promise<boolean>;

  /**
   * Update assistant message by database id (supports when local id is 'db:<id>')
   * Returns true if an update occurred, false otherwise
   */
  updateAssistantMessageByDbId?(args: {
    dbId: number;
    newContent: string;
    session: Session;
  }): Promise<boolean>;

  /**
   * Update user message by database id (used when editing and regenerating)
   * Returns true if an update occurred, false otherwise
   */
  updateUserMessageByDbId?(args: {
    dbId: number;
    newContent: string;
    session: Session;
  }): Promise<boolean>;

  /**
   * Load messages for a specific room
   */
  loadMessages(roomId: number): Promise<ChatMessage[]>;

  /**
   * Delete messages for a room
   */
  deleteMessages(roomId: number): Promise<void>;
}

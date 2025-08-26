// Business layer interface - Port for message persistence
import { ChatMessage } from '../entities/ChatMessage';

export interface IMessageRepository {
  /**
   * Save messages to persistent storage
   */
  saveMessages(roomId: number, userMessage: ChatMessage, assistantMessage: ChatMessage, userId: string): Promise<void>;
  
  /**
   * Load all messages for a chat room
   */
  loadMessages(roomId: number): Promise<ChatMessage[]>;
  
  /**
   * Update an assistant message by client ID
   */
  updateAssistantMessage(roomId: number, messageId: string, newContent: string, userId: string): Promise<boolean>;
  
  /**
   * Update a message by database ID
   */
  updateMessageById(dbId: number, newContent: string, userId: string): Promise<boolean>;
  
  /**
   * Delete all messages in a room
   */
  deleteMessages(roomId: number): Promise<void>;
}

// Message repository implementation using Supabase
import { ChatMessage } from '../../business/entities/ChatMessage';
import { IMessageRepository } from '../../business/interfaces/IMessageRepository';
import { generateMessageId } from '../../services/utils/idGenerator';
import { SupabaseAdapter } from '../adapters/SupabaseAdapter';
import { MessageMapper } from '../mappers/MessageMapper';

export class SupabaseMessageRepository implements IMessageRepository {
  private adapter: SupabaseAdapter;

  constructor() {
    this.adapter = SupabaseAdapter.getInstance();
  }

  async saveMessages(
    roomId: number,
    userMessage: ChatMessage,
    assistantMessage: ChatMessage,
    userId: string
  ): Promise<void> {
    try {
      // Convert entities to database rows
      const userRow = MessageMapper.toDatabase(userMessage, roomId, userId);
      const assistantRow = MessageMapper.toDatabase(assistantMessage, roomId, userId);

      // Ensure assistant message has a client_id for tracking
      if (!assistantRow.client_id) {
        assistantRow.client_id = assistantMessage.id || generateMessageId();
      }

      await this.adapter.insertMessages([userRow, assistantRow]);
    } catch (error) {
      console.error('Failed to save messages:', error);
      throw error;
    }
  }

  async loadMessages(roomId: number): Promise<ChatMessage[]> {
    try {
      const rows = await this.adapter.selectMessages(roomId);
      return rows.map(MessageMapper.toEntity);
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  }

  async updateAssistantMessage(
    roomId: number,
    messageId: string,
    newContent: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Find the message by client_id and room_id
      const messages = await this.adapter.selectMessages(roomId);
      const messageToUpdate = messages.find(
        m => m.client_id === messageId && m.role === 'assistant'
      );

      if (!messageToUpdate) {
        return false;
      }

      await this.adapter.updateMessage(messageToUpdate.id, {
        content: newContent
      });

      return true;
    } catch (error) {
      console.error('Failed to update assistant message:', error);
      return false;
    }
  }

  async updateMessageById(
    dbId: number,
    newContent: string,
    userId: string
  ): Promise<boolean> {
    try {
      await this.adapter.updateMessage(dbId, {
        content: newContent
      });
      return true;
    } catch (error) {
      console.error('Failed to update message by ID:', error);
      return false;
    }
  }

  async deleteMessages(roomId: number): Promise<void> {
    try {
      await this.adapter.deleteMessages(roomId);
    } catch (error) {
      console.error('Failed to delete messages:', error);
      throw error;
    }
  }
}

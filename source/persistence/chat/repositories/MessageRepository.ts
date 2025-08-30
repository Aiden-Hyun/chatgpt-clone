import { Session } from '@supabase/supabase-js';
import { Logger } from '../../../service/shared/utils/Logger';
import { IMessageRepository } from '../../interfaces/chat';
import { IUserSession } from '../../interfaces/shared';
import { SessionMapper } from '../../shared/mappers/SessionMapper';
import { SupabaseMessageAdapter } from '../adapters/SupabaseMessageAdapter';
import { MessageMapper } from '../mappers/MessageMapper';

export interface SaveMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

export interface GetMessagesResult {
  success: boolean;
  messages?: MessageEntity[];
  error?: string;
}

export class MessageRepository implements IMessageRepository {
  constructor(
    private messageAdapter: SupabaseMessageAdapter = new SupabaseMessageAdapter(),
    private messageMapper: MessageMapper = new MessageMapper(),
    private logger: Logger = new Logger()
  ) {}

  async save(message: MessageEntity, session: IUserSession): Promise<SaveMessageResult> {
    try {
      this.logger.info('MessageRepository: Saving message', { messageId: message.id });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      
      const messageData = this.messageMapper.toData(message);
      await this.messageAdapter.save(messageData, supabaseSessionData as Session);

      return {
        success: true,
        message: message
      };
    } catch (error) {
      this.logger.error('MessageRepository: Error saving message', { error, messageId: message.id });
      return {
        success: false,
        error: 'Failed to save message'
      };
    }
  }

  async update(message: MessageEntity, session: IUserSession): Promise<SaveMessageResult> {
    try {
      this.logger.info('MessageRepository: Updating message', { messageId: message.id });

      const messageData = this.messageMapper.toData(message);
      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      await this.messageAdapter.update(messageData, supabaseSessionData as Session);

      return {
        success: true,
        message: message
      };
    } catch (error) {
      this.logger.error('MessageRepository: Error updating message', { error, messageId: message.id });
      return {
        success: false,
        error: 'Failed to update message'
      };
    }
  }

  async getById(messageId: string, session: IUserSession): Promise<MessageEntity | null> {
    try {
      this.logger.info('MessageRepository: Getting message by ID', { messageId });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      const messageData = await this.messageAdapter.getById(messageId, supabaseSessionData as Session);
      
      if (messageData) {
        return this.messageMapper.toEntity(messageData);
      }
      
      return null;
    } catch (error) {
      this.logger.error('MessageRepository: Error getting message by ID', { error, messageId });
      return null;
    }
  }

  async getByRoomId(roomId: string, session: IUserSession): Promise<MessageEntity[]> {
    try {
      this.logger.info('MessageRepository: Getting messages by room ID', { roomId });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      const messageDataArray = await this.messageAdapter.getByRoomId(roomId, supabaseSessionData as Session);
      
      return messageDataArray.map(messageData => this.messageMapper.toEntity(messageData));
    } catch (error) {
      this.logger.error('MessageRepository: Error getting messages by room ID', { error, roomId });
      return [];
    }
  }

  async getRecentByRoomId(roomId: string, limit: number, session: IUserSession): Promise<MessageEntity[]> {
    try {
      this.logger.info('MessageRepository: Getting recent messages by room ID', { roomId, limit });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      const result = await this.messageAdapter.getRecentByRoomId(roomId, limit, supabaseSessionData as Session);
      
      if (result.success && result.data) {
        return result.data.map(messageData => this.messageMapper.toEntity(messageData));
      }
      
      return [];
    } catch (error) {
      this.logger.error('MessageRepository: Error getting recent messages by room ID', { error, roomId, limit });
      return [];
    }
  }

  async delete(messageId: string, session: IUserSession): Promise<{ success: boolean; error?: string; }> {
    try {
      this.logger.info('MessageRepository: Deleting message', { messageId });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      await this.messageAdapter.delete(messageId, supabaseSessionData as Session);
      return { success: true };
    } catch (error) {
      this.logger.error('MessageRepository: Error deleting message', { error, messageId });
      return { 
        success: false, 
        error: 'Failed to delete message'
      };
    }
  }

  async deleteByRoomId(roomId: string): Promise<boolean> {
    try {
      this.logger.info('MessageRepository: Deleting messages by room ID', { roomId });

      const result = await this.messageAdapter.deleteByRoomId(roomId);
      return result.success;
    } catch (error) {
      this.logger.error('MessageRepository: Error deleting messages by room ID', { error, roomId });
      return false;
    }
  }

  async searchByContent(roomId: string, query: string): Promise<MessageEntity[]> {
    try {
      this.logger.info('MessageRepository: Searching messages by content', { roomId, query });

      const result = await this.messageAdapter.searchByContent(roomId, query);
      
      if (result.success && result.data) {
        return result.data.map(messageData => this.messageMapper.toEntity(messageData));
      }
      
      return [];
    } catch (error) {
      this.logger.error('MessageRepository: Error searching messages by content', { error, roomId, query });
      return [];
    }
  }

  async getMessageCount(roomId: string): Promise<number> {
    try {
      this.logger.info('MessageRepository: Getting message count', { roomId });

      const result = await this.messageAdapter.getMessageCount(roomId);
      
      if (result.success) {
        return result.count || 0;
      }
      
      return 0;
    } catch (error) {
      this.logger.error('MessageRepository: Error getting message count', { error, roomId });
      return 0;
    }
  }
}

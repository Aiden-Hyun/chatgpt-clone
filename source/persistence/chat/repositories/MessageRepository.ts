import { MessageEntity, Message } from '../../../business/chat/entities/Message';
import { MessageMapper } from '../mappers/MessageMapper';
import { SupabaseMessageAdapter } from '../adapters/SupabaseMessageAdapter';
import { Logger } from '../../../service/shared/utils/Logger';

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

export class MessageRepository {
  constructor(
    private messageAdapter: SupabaseMessageAdapter = new SupabaseMessageAdapter(),
    private messageMapper: MessageMapper = new MessageMapper(),
    private logger: Logger = new Logger()
  ) {}

  async save(message: MessageEntity): Promise<SaveMessageResult> {
    try {
      this.logger.info('MessageRepository: Saving message', { messageId: message.id });

      const messageData = this.messageMapper.toData(message);
      const result = await this.messageAdapter.save(messageData);

      if (result.success) {
        const savedMessage = this.messageMapper.toEntity(result.data!);
        return {
          success: true,
          message: savedMessage
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      this.logger.error('MessageRepository: Error saving message', { error, messageId: message.id });
      return {
        success: false,
        error: 'Failed to save message'
      };
    }
  }

  async update(message: MessageEntity): Promise<SaveMessageResult> {
    try {
      this.logger.info('MessageRepository: Updating message', { messageId: message.id });

      const messageData = this.messageMapper.toData(message);
      const result = await this.messageAdapter.update(messageData);

      if (result.success) {
        const updatedMessage = this.messageMapper.toEntity(result.data!);
        return {
          success: true,
          message: updatedMessage
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      this.logger.error('MessageRepository: Error updating message', { error, messageId: message.id });
      return {
        success: false,
        error: 'Failed to update message'
      };
    }
  }

  async getById(messageId: string): Promise<MessageEntity | null> {
    try {
      this.logger.info('MessageRepository: Getting message by ID', { messageId });

      const result = await this.messageAdapter.getById(messageId);
      
      if (result.success && result.data) {
        return this.messageMapper.toEntity(result.data);
      }
      
      return null;
    } catch (error) {
      this.logger.error('MessageRepository: Error getting message by ID', { error, messageId });
      return null;
    }
  }

  async getByRoomId(roomId: string): Promise<MessageEntity[]> {
    try {
      this.logger.info('MessageRepository: Getting messages by room ID', { roomId });

      const result = await this.messageAdapter.getByRoomId(roomId);
      
      if (result.success && result.data) {
        return result.data.map(messageData => this.messageMapper.toEntity(messageData));
      }
      
      return [];
    } catch (error) {
      this.logger.error('MessageRepository: Error getting messages by room ID', { error, roomId });
      return [];
    }
  }

  async getRecentByRoomId(roomId: string, limit: number = 50): Promise<MessageEntity[]> {
    try {
      this.logger.info('MessageRepository: Getting recent messages by room ID', { roomId, limit });

      const result = await this.messageAdapter.getRecentByRoomId(roomId, limit);
      
      if (result.success && result.data) {
        return result.data.map(messageData => this.messageMapper.toEntity(messageData));
      }
      
      return [];
    } catch (error) {
      this.logger.error('MessageRepository: Error getting recent messages by room ID', { error, roomId, limit });
      return [];
    }
  }

  async delete(messageId: string): Promise<boolean> {
    try {
      this.logger.info('MessageRepository: Deleting message', { messageId });

      const result = await this.messageAdapter.delete(messageId);
      return result.success;
    } catch (error) {
      this.logger.error('MessageRepository: Error deleting message', { error, messageId });
      return false;
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

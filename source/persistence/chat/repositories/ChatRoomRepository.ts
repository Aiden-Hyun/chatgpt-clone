import { ChatRoomEntity, ChatRoom } from '../../../business/chat/entities/ChatRoom';
import { ChatRoomMapper } from '../mappers/ChatRoomMapper';
import { SupabaseChatRoomAdapter } from '../adapters/SupabaseChatRoomAdapter';
import { Logger } from '../../../service/shared/utils/Logger';

export interface SaveRoomResult {
  success: boolean;
  room?: ChatRoomEntity;
  error?: string;
}

export interface GetRoomsResult {
  success: boolean;
  rooms?: ChatRoomEntity[];
  error?: string;
}

export class ChatRoomRepository {
  constructor(
    private chatRoomAdapter: SupabaseChatRoomAdapter = new SupabaseChatRoomAdapter(),
    private chatRoomMapper: ChatRoomMapper = new ChatRoomMapper(),
    private logger: Logger = new Logger()
  ) {}

  async save(room: ChatRoomEntity): Promise<SaveRoomResult> {
    try {
      this.logger.info('ChatRoomRepository: Saving chat room', { roomId: room.id });

      const roomData = this.chatRoomMapper.toData(room);
      const result = await this.chatRoomAdapter.save(roomData);

      if (result.success) {
        const savedRoom = this.chatRoomMapper.toEntity(result.data!);
        return {
          success: true,
          room: savedRoom
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error saving chat room', { error, roomId: room.id });
      return {
        success: false,
        error: 'Failed to save chat room'
      };
    }
  }

  async update(room: ChatRoomEntity): Promise<SaveRoomResult> {
    try {
      this.logger.info('ChatRoomRepository: Updating chat room', { roomId: room.id });

      const roomData = this.chatRoomMapper.toData(room);
      const result = await this.chatRoomAdapter.update(roomData);

      if (result.success) {
        const updatedRoom = this.chatRoomMapper.toEntity(result.data!);
        return {
          success: true,
          room: updatedRoom
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error updating chat room', { error, roomId: room.id });
      return {
        success: false,
        error: 'Failed to update chat room'
      };
    }
  }

  async getById(roomId: string): Promise<ChatRoomEntity | null> {
    try {
      this.logger.info('ChatRoomRepository: Getting chat room by ID', { roomId });

      const result = await this.chatRoomAdapter.getById(roomId);
      
      if (result.success && result.data) {
        return this.chatRoomMapper.toEntity(result.data);
      }
      
      return null;
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error getting chat room by ID', { error, roomId });
      return null;
    }
  }

  async getByUserId(userId: string): Promise<ChatRoomEntity[]> {
    try {
      this.logger.info('ChatRoomRepository: Getting chat rooms by user ID', { userId });

      const result = await this.chatRoomAdapter.getByUserId(userId);
      
      if (result.success && result.data) {
        return result.data.map(roomData => this.chatRoomMapper.toEntity(roomData));
      }
      
      return [];
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error getting chat rooms by user ID', { error, userId });
      return [];
    }
  }

  async getActiveByUserId(userId: string): Promise<ChatRoomEntity[]> {
    try {
      this.logger.info('ChatRoomRepository: Getting active chat rooms by user ID', { userId });

      const result = await this.chatRoomAdapter.getActiveByUserId(userId);
      
      if (result.success && result.data) {
        return result.data.map(roomData => this.chatRoomMapper.toEntity(roomData));
      }
      
      return [];
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error getting active chat rooms by user ID', { error, userId });
      return [];
    }
  }

  async delete(roomId: string): Promise<boolean> {
    try {
      this.logger.info('ChatRoomRepository: Deleting chat room', { roomId });

      const result = await this.chatRoomAdapter.delete(roomId);
      return result.success;
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error deleting chat room', { error, roomId });
      return false;
    }
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      this.logger.info('ChatRoomRepository: Deleting chat rooms by user ID', { userId });

      const result = await this.chatRoomAdapter.deleteByUserId(userId);
      return result.success;
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error deleting chat rooms by user ID', { error, userId });
      return false;
    }
  }

  async searchByName(userId: string, query: string): Promise<ChatRoomEntity[]> {
    try {
      this.logger.info('ChatRoomRepository: Searching chat rooms by name', { userId, query });

      const result = await this.chatRoomAdapter.searchByName(userId, query);
      
      if (result.success && result.data) {
        return result.data.map(roomData => this.chatRoomMapper.toEntity(roomData));
      }
      
      return [];
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error searching chat rooms by name', { error, userId, query });
      return [];
    }
  }

  async getRoomCount(userId: string): Promise<number> {
    try {
      this.logger.info('ChatRoomRepository: Getting room count', { userId });

      const result = await this.chatRoomAdapter.getRoomCount(userId);
      
      if (result.success) {
        return result.count || 0;
      }
      
      return 0;
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error getting room count', { error, userId });
      return 0;
    }
  }

  async updateLastMessage(roomId: string, messageId: string, timestamp: Date): Promise<boolean> {
    try {
      this.logger.info('ChatRoomRepository: Updating last message', { roomId, messageId });

      const result = await this.chatRoomAdapter.updateLastMessage(roomId, messageId, timestamp);
      return result.success;
    } catch (error) {
      this.logger.error('ChatRoomRepository: Error updating last message', { error, roomId, messageId });
      return false;
    }
  }
}

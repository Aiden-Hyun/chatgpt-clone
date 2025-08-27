import { ChatRoom } from '../../../business/chat/entities/ChatRoom';
import { ChatRoomMapper } from '../mappers/ChatRoomMapper';
import { SupabaseChatRoomAdapter } from '../adapters/SupabaseChatRoomAdapter';
import { Logger } from '../../../service/shared/utils/Logger';
import { Session } from '@supabase/supabase-js';

export interface CreateRoomResult {
  success: boolean;
  room?: ChatRoom;
  error?: string;
}

export interface UpdateRoomResult {
  success: boolean;
  room?: ChatRoom;
  error?: string;
}

export interface DeleteRoomResult {
  success: boolean;
  error?: string;
}

export class ChatRoomRepository {
  constructor(
    private chatRoomAdapter: SupabaseChatRoomAdapter = new SupabaseChatRoomAdapter(),
    private chatRoomMapper: ChatRoomMapper = new ChatRoomMapper()
  ) {}

  async create(model: string, session: Session, name?: string): Promise<CreateRoomResult> {
    try {
      Logger.info('ChatRoomRepository: Creating chat room', { userId: session.user.id, model, name });

      const roomId = await this.chatRoomAdapter.createRoom(session, model, name);

      if (roomId === null) {
        return {
          success: false,
          error: 'Failed to create room'
        };
      }

      // Get the created room to return full data
      const roomData = await this.chatRoomAdapter.getRoom(roomId, session);
      if (!roomData) {
        return {
          success: false,
          error: 'Room created but could not retrieve data'
        };
      }

      const room = this.chatRoomMapper.fromSupabaseData(roomData);
      return {
        success: true,
        room
      };
    } catch (error) {
      Logger.error('ChatRoomRepository: Error creating chat room', { error, userId: session.user.id });
      return {
        success: false,
        error: 'Failed to create chat room'
      };
    }
  }

  async update(room: ChatRoom, session: Session): Promise<UpdateRoomResult> {
    try {
      Logger.info('ChatRoomRepository: Updating chat room', { roomId: room.id });

      const roomId = this.chatRoomMapper.toAdapterRoomId(room.id);
      await this.chatRoomAdapter.updateRoom(roomId, {
        name: room.name,
        model: room.model,
        updated_at: room.updatedAt.toISOString()
      }, session);

      // Get updated room data
      const updatedRoomData = await this.chatRoomAdapter.getRoom(roomId, session);
      if (!updatedRoomData) {
        return {
          success: false,
          error: 'Failed to retrieve updated room data'
        };
      }

      const updatedRoom = this.chatRoomMapper.fromSupabaseData(updatedRoomData);
      return {
        success: true,
        room: updatedRoom
      };
    } catch (error) {
      Logger.error('ChatRoomRepository: Error updating chat room', { error, roomId: room.id });
      return {
        success: false,
        error: 'Failed to update chat room'
      };
    }
  }

  async getById(roomId: string, session: Session): Promise<ChatRoom | null> {
    try {
      Logger.info('ChatRoomRepository: Getting chat room by ID', { roomId });

      const numericRoomId = this.chatRoomMapper.toAdapterRoomId(roomId);
      const roomData = await this.chatRoomAdapter.getRoom(numericRoomId, session);
      
      if (roomData) {
        return this.chatRoomMapper.fromSupabaseData(roomData);
      }
      
      return null;
    } catch (error) {
      Logger.error('ChatRoomRepository: Error getting chat room by ID', { error, roomId });
      return null;
    }
  }

  async listByUserId(session: Session): Promise<ChatRoom[]> {
    try {
      Logger.info('ChatRoomRepository: Getting chat rooms for user', { userId: session.user.id });

      const roomsData = await this.chatRoomAdapter.listRooms(session);
      
      return roomsData.map(roomData => this.chatRoomMapper.fromSupabaseDataWithLastMessage(roomData));
    } catch (error) {
      Logger.error('ChatRoomRepository: Error getting chat rooms for user', { error, userId: session.user.id });
      return [];
    }
  }

  async delete(roomId: string, session: Session): Promise<DeleteRoomResult> {
    try {
      Logger.info('ChatRoomRepository: Deleting chat room', { roomId });

      const numericRoomId = this.chatRoomMapper.toAdapterRoomId(roomId);
      await this.chatRoomAdapter.deleteRoom(numericRoomId, session);
      
      return { success: true };
    } catch (error) {
      Logger.error('ChatRoomRepository: Error deleting chat room', { error, roomId });
      return {
        success: false,
        error: 'Failed to delete chat room'
      };
    }
  }
}

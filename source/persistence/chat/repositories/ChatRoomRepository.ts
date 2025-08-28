import { Session } from '@supabase/supabase-js';
import { ChatRoom } from '../../../business/chat/entities/ChatRoom';
import { CreateRoomResult, DeleteRoomResult, IChatRoomRepository, UpdateRoomResult } from '../../../business/chat/interfaces/IChatRoomRepository';
import { IUserSession } from '../../../business/shared/interfaces/IUserSession';
import { Logger } from '../../../service/shared/utils/Logger';
import { SessionMapper } from '../../shared/mappers/SessionMapper';
import { SupabaseChatRoomAdapter } from '../adapters/SupabaseChatRoomAdapter';
import { ChatRoomMapper } from '../mappers/ChatRoomMapper';

export class ChatRoomRepository implements IChatRoomRepository {
  constructor(
    private chatRoomAdapter: SupabaseChatRoomAdapter = new SupabaseChatRoomAdapter(),
    private chatRoomMapper: ChatRoomMapper = new ChatRoomMapper()
  ) {}

  async create(model: string, session: IUserSession, name?: string): Promise<CreateRoomResult> {
    try {
      Logger.info('ChatRoomRepository: Creating chat room', { userId: session.userId, model, name });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      const roomId = await this.chatRoomAdapter.createRoom(supabaseSessionData as Session, model, name);

      if (roomId === null) {
        return {
          success: false,
          error: 'Failed to create room'
        };
      }

      // Get the created room to return full data
      const roomData = await this.chatRoomAdapter.getRoom(roomId, supabaseSessionData as Session);
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
      Logger.error('ChatRoomRepository: Error creating chat room', { error, userId: session.userId });
      return {
        success: false,
        error: 'Failed to create chat room'
      };
    }
  }

  async update(room: ChatRoom, session: IUserSession): Promise<UpdateRoomResult> {
    try {
      Logger.info('ChatRoomRepository: Updating chat room', { roomId: room.id });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      
      const roomId = this.chatRoomMapper.toAdapterRoomId(room.id);
      await this.chatRoomAdapter.updateRoom(roomId, {
        name: room.name,
        model: room.model,
        updated_at: room.updatedAt.toISOString()
      }, supabaseSessionData as Session);

      // Get updated room data
      const updatedRoomData = await this.chatRoomAdapter.getRoom(roomId, supabaseSessionData as Session);
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

  async getById(roomId: string, session: IUserSession): Promise<ChatRoom | null> {
    try {
      Logger.info('ChatRoomRepository: Getting chat room by ID', { roomId });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      
      const numericRoomId = this.chatRoomMapper.toAdapterRoomId(roomId);
      const roomData = await this.chatRoomAdapter.getRoom(numericRoomId, supabaseSessionData as Session);
      
      if (roomData) {
        return this.chatRoomMapper.fromSupabaseData(roomData);
      }
      
      return null;
    } catch (error) {
      Logger.error('ChatRoomRepository: Error getting chat room by ID', { error, roomId });
      return null;
    }
  }

  async listByUserId(userId: string, session: IUserSession): Promise<ChatRoom[]> {
    try {
      Logger.info('ChatRoomRepository: Getting chat rooms for user', { userId: session.userId });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      const roomsData = await this.chatRoomAdapter.listRooms(supabaseSessionData as Session);
      
      return roomsData.map(roomData => this.chatRoomMapper.fromSupabaseDataWithLastMessage(roomData));
    } catch (error) {
      Logger.error('ChatRoomRepository: Error getting chat rooms for user', { error, userId: session.userId });
      return [];
    }
  }

  async delete(roomId: string, session: IUserSession): Promise<DeleteRoomResult> {
    try {
      Logger.info('ChatRoomRepository: Deleting chat room', { roomId });

      // Convert business session to Supabase session for adapter
      const supabaseSessionData = SessionMapper.toSupabaseSessionData(session);
      
      const numericRoomId = this.chatRoomMapper.toAdapterRoomId(roomId);
      await this.chatRoomAdapter.deleteRoom(numericRoomId, supabaseSessionData as Session);
      
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

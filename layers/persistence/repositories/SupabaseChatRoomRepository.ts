// Chat room repository implementation using Supabase
import { ChatRoom } from '../../business/entities/ChatRoom';
import { IChatRoomRepository } from '../../business/interfaces/IChatRoomRepository';
import { SupabaseAdapter } from '../adapters/SupabaseAdapter';
import { ChatRoomMapper } from '../mappers/ChatRoomMapper';

export class SupabaseChatRoomRepository implements IChatRoomRepository {
  private adapter: SupabaseAdapter;

  constructor() {
    this.adapter = SupabaseAdapter.getInstance();
  }

  async createRoom(userId: string, model: string, title?: string): Promise<number> {
    try {
      const roomData = {
        user_id: userId,
        model,
        title: title || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const room = await this.adapter.insertChatRoom(roomData);
      return room.id;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const rows = await this.adapter.selectChatRooms(userId);
      return rows.map(ChatRoomMapper.toEntity);
    } catch (error) {
      console.error('Failed to get user rooms:', error);
      return [];
    }
  }

  async getRoom(roomId: number, userId: string): Promise<ChatRoom | null> {
    try {
      const row = await this.adapter.selectChatRoom(roomId, userId);
      return row ? ChatRoomMapper.toEntity(row) : null;
    } catch (error) {
      console.error('Failed to get room:', error);
      return null;
    }
  }

  async updateRoomTitle(roomId: number, title: string, userId: string): Promise<boolean> {
    try {
      const updated = await this.adapter.updateChatRoom(roomId, userId, { title });
      return !!updated;
    } catch (error) {
      console.error('Failed to update room title:', error);
      return false;
    }
  }

  async updateRoomModel(roomId: number, model: string, userId: string): Promise<boolean> {
    try {
      const updated = await this.adapter.updateChatRoom(roomId, userId, { model });
      return !!updated;
    } catch (error) {
      console.error('Failed to update room model:', error);
      return false;
    }
  }

  async deleteRoom(roomId: number, userId: string): Promise<boolean> {
    try {
      // First delete all messages in the room
      await this.adapter.deleteMessages(roomId);
      
      // Then delete the room itself
      return await this.adapter.deleteChatRoom(roomId, userId);
    } catch (error) {
      console.error('Failed to delete room:', error);
      return false;
    }
  }
}

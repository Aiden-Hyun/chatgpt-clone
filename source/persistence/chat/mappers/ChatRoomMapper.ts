import { ChatRoom } from '../../../business/chat/entities/ChatRoom';
import { RoomData, RoomWithLastMessage } from '../adapters/SupabaseChatRoomAdapter';

export interface ChatRoomData {
  id: string; // Domain uses string, adapter uses number
  name: string;
  model: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastActivity?: Date;
}

export class ChatRoomMapper {
  /**
   * Convert from domain entity to persistence data
   */
  toData(chatRoom: ChatRoom): ChatRoomData {
    return {
      id: chatRoom.id,
      name: chatRoom.name,
      model: chatRoom.model,
      userId: chatRoom.userId,
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt,
      lastMessage: chatRoom.lastMessage,
      lastActivity: chatRoom.lastActivity,
    };
  }

  /**
   * Convert from persistence data to domain entity
   */
  toEntity(data: ChatRoomData): ChatRoom {
    return new ChatRoom({
      id: data.id,
      name: data.name,
      model: data.model,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastMessage: data.lastMessage,
      lastActivity: data.lastActivity,
    });
  }

  /**
   * Convert from Supabase adapter data to domain entity
   */
  fromSupabaseData(data: RoomData): ChatRoom {
    return new ChatRoom({
      id: data.id.toString(), // Convert number to string
      name: data.name,
      model: data.model,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  /**
   * Convert from Supabase adapter data with last message to domain entity
   */
  fromSupabaseDataWithLastMessage(data: RoomWithLastMessage): ChatRoom {
    return new ChatRoom({
      id: data.id.toString(), // Convert number to string
      name: data.name,
      model: data.model,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastMessage: data.last_message,
      lastActivity: data.last_activity ? new Date(data.last_activity) : undefined,
    });
  }

  /**
   * Convert domain entity ID to adapter format
   */
  toAdapterRoomId(domainId: string): number {
    const numericId = parseInt(domainId, 10);
    if (isNaN(numericId)) {
      throw new Error(`Invalid room ID format: ${domainId}. Expected numeric string.`);
    }
    return numericId;
  }

  /**
   * Convert adapter room ID to domain format
   */
  fromAdapterRoomId(adapterId: number): string {
    return adapterId.toString();
  }
}
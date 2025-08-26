// Mapper between chat room entities and database rows
import { ChatRoom, ChatRoomEntity } from '../../business/entities/ChatRoom';
import { ChatRoomRow } from '../../database/types/DatabaseTypes';

export class ChatRoomMapper {
  static toEntity(row: ChatRoomRow): ChatRoom {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title || undefined,
      model: row.model,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  static toDatabase(room: ChatRoom): Partial<ChatRoomRow> {
    return {
      id: room.id,
      user_id: room.userId,
      title: room.title || null,
      model: room.model,
      created_at: room.createdAt.toISOString(),
      updated_at: room.updatedAt.toISOString()
    };
  }
}

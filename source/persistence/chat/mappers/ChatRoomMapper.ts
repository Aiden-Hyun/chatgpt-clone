import { ChatRoomEntity, ChatRoom } from '../../../business/chat/entities/ChatRoom';

export interface ChatRoomData {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  message_count: number;
  last_message_id?: string;
  last_message_timestamp?: string;
}

export class ChatRoomMapper {
  toData(entity: ChatRoomEntity): ChatRoomData {
    return {
      id: entity.id,
      name: entity.name,
      user_id: entity.userId,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      is_active: entity.isActive,
      message_count: entity.messageCount,
      last_message_id: entity.lastMessageId,
      last_message_timestamp: entity.lastMessageTimestamp?.toISOString()
    };
  }

  toEntity(data: ChatRoomData): ChatRoomEntity {
    return new ChatRoomEntity({
      id: data.id,
      name: data.name,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active,
      messageCount: data.message_count,
      lastMessageId: data.last_message_id,
      lastMessageTimestamp: data.last_message_timestamp ? new Date(data.last_message_timestamp) : undefined
    });
  }

  toDataList(entities: ChatRoomEntity[]): ChatRoomData[] {
    return entities.map(entity => this.toData(entity));
  }

  toEntityList(dataList: ChatRoomData[]): ChatRoomEntity[] {
    return dataList.map(data => this.toEntity(data));
  }
}

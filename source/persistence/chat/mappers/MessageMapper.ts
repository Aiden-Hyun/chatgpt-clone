
export interface MessageData {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  room_id: string;
  user_id?: string;
  is_deleted: boolean;
  metadata?: string;
}

export class MessageMapper {
  toData(entity: MessageEntity): MessageData {
    return {
      id: entity.id,
      content: entity.content,
      role: entity.role,
      timestamp: entity.timestamp.toISOString(),
      room_id: entity.roomId,
      user_id: entity.userId,
      is_deleted: entity.isDeleted,
      metadata: entity.metadata ? JSON.stringify(entity.metadata) : undefined
    };
  }

  toEntity(data: MessageData): MessageEntity {
    return new MessageEntity({
      id: data.id,
      content: data.content,
      role: data.role as MessageRole,
      timestamp: new Date(data.timestamp),
      roomId: data.room_id,
      userId: data.user_id,
      isDeleted: data.is_deleted,
      metadata: data.metadata ? JSON.parse(data.metadata) : undefined
    });
  }

  toDataList(entities: MessageEntity[]): MessageData[] {
    return entities.map(entity => this.toData(entity));
  }

  toEntityList(dataList: MessageData[]): MessageEntity[] {
    return dataList.map(data => this.toEntity(data));
  }
}

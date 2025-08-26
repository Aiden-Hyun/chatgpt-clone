// Mapper between business entities and database rows
import { ChatMessage, ChatMessageEntity } from '../../business/entities/ChatMessage';
import { MessageRow } from '../../database/types/DatabaseTypes';

export class MessageMapper {
  static toEntity(row: MessageRow): ChatMessage {
    return {
      id: row.client_id || `db:${row.id}`,
      role: row.role,
      content: row.content,
      timestamp: new Date(row.created_at)
    };
  }

  static toDatabase(
    message: ChatMessage,
    roomId: number,
    userId: string
  ): Partial<MessageRow> {
    return {
      room_id: roomId,
      user_id: userId,
      role: message.role,
      content: message.content,
      client_id: message.id || null,
      created_at: message.timestamp?.toISOString() || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static fromEntityList(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      isLoading: msg.isLoading,
      isAnimating: msg.isAnimating,
      error: msg.error
    }));
  }
}

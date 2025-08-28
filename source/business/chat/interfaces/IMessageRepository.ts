import { IUserSession } from '../../shared/interfaces/IUserSession';
import { MessageEntity } from '../entities/Message';

export interface SaveMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

export interface IMessageRepository {
  save(message: MessageEntity, session: IUserSession): Promise<SaveMessageResult>;
  update(message: MessageEntity, session: IUserSession): Promise<SaveMessageResult>;
  getById(messageId: string, session: IUserSession): Promise<MessageEntity | null>;
  getByRoomId(roomId: string, session: IUserSession): Promise<MessageEntity[]>;
  getRecentByRoomId(roomId: string, limit: number, session: IUserSession): Promise<MessageEntity[]>;
  delete(messageId: string, session: IUserSession): Promise<{ success: boolean; error?: string; }>;
}

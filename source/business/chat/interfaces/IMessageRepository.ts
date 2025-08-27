import { Session } from '@supabase/supabase-js';
import { MessageEntity } from '../entities/Message';

export interface SaveMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

export interface IMessageRepository {
  save(message: MessageEntity, session: Session): Promise<SaveMessageResult>;
  update(message: MessageEntity, session: Session): Promise<SaveMessageResult>;
  getById(messageId: string, session: Session): Promise<MessageEntity | null>;
  getByRoomId(roomId: string, session: Session): Promise<MessageEntity[]>;
  getRecentByRoomId(roomId: string, limit: number, session: Session): Promise<MessageEntity[]>;
  delete(messageId: string, session: Session): Promise<{ success: boolean; error?: string; }>;
}

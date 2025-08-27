import { Session } from '@supabase/supabase-js';
import { ChatRoom } from '../entities/ChatRoom';

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

export interface IChatRoomRepository {
  create(model: string, session: Session, name?: string): Promise<CreateRoomResult>;
  update(room: ChatRoom, session: Session): Promise<UpdateRoomResult>;
  getById(roomId: string, session: Session): Promise<ChatRoom | null>;
  listByUserId(userId: string, session: Session): Promise<ChatRoom[]>;
  delete(roomId: string, session: Session): Promise<DeleteRoomResult>;
}

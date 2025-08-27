import { Session } from '@supabase/supabase-js';
import { ChatRoomEntity } from '../entities/ChatRoom';

export interface CreateRoomResult {
  success: boolean;
  room?: ChatRoomEntity;
  error?: string;
}

export interface UpdateRoomResult {
  success: boolean;
  room?: ChatRoomEntity;
  error?: string;
}

export interface DeleteRoomResult {
  success: boolean;
  error?: string;
}

export interface IChatRoomRepository {
  create(model: string, session: Session, name?: string): Promise<CreateRoomResult>;
  update(room: ChatRoomEntity, session: Session): Promise<UpdateRoomResult>;
  getById(roomId: string, session: Session): Promise<ChatRoomEntity | null>;
  listByUserId(userId: string, session: Session): Promise<ChatRoomEntity[]>;
  delete(roomId: string, session: Session): Promise<DeleteRoomResult>;
}

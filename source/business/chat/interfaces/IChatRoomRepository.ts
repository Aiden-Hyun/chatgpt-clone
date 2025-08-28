import { IUserSession } from '../../shared/interfaces/IUserSession';
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
  create(model: string, session: IUserSession, name?: string): Promise<CreateRoomResult>;
  update(room: ChatRoomEntity, session: IUserSession): Promise<UpdateRoomResult>;
  getById(roomId: string, session: IUserSession): Promise<ChatRoomEntity | null>;
  listByUserId(userId: string, session: IUserSession): Promise<ChatRoomEntity[]>;
  delete(roomId: string, session: IUserSession): Promise<DeleteRoomResult>;
}

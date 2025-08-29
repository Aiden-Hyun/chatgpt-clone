import { ChatRoomRepository } from '../../../persistence/chat/repositories/ChatRoomRepository';
import { Logger } from '../../../service/shared/utils/Logger';
import { IUserSession } from '../../shared/interfaces/IUserSession';
import { ChatRoom } from '../entities/ChatRoom';

export interface ListRoomsParams {
  session: IUserSession;
}

export interface ListRoomsResult {
  success: boolean;
  rooms?: ChatRoom[];
  error?: string;
}

export class ListRoomsUseCase {
  constructor(
    private chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(params: ListRoomsParams): Promise<ListRoomsResult> {
    try {
      Logger.info('ListRoomsUseCase: Listing chat rooms', { 
        userId: params.session.userId 
      });

      // Business rule: Get all rooms for user with last message info
      const rooms = await this.chatRoomRepository.listByUserId(params.session);

      // Business rule: Sort by last activity (most recent first)
      const sortedRooms = rooms.sort((a, b) => {
        const aTime = a.lastActivity || a.updatedAt;
        const bTime = b.lastActivity || b.updatedAt;
        return bTime.getTime() - aTime.getTime();
      });

      Logger.info('ListRoomsUseCase: Rooms listed successfully', { 
        userId: params.session.userId,
        roomCount: sortedRooms.length 
      });

      return { 
        success: true, 
        rooms: sortedRooms 
      };

    } catch (error) {
      Logger.error('ListRoomsUseCase: Failed to list rooms', { 
        error, 
        userId: params.session.userId 
      });
      return { success: false, error: 'Failed to list rooms' };
    }
  }
}

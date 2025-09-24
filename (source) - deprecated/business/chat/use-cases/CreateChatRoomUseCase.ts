import { IChatRoomRepository, ICreateChatRoomUseCase, RoomResult } from '../../interfaces/chat';
import { IUserSession } from '../../interfaces/shared';

/**
 * Use case for creating a new chat room
 */
export class CreateChatRoomUseCase implements ICreateChatRoomUseCase {
  constructor(
    private chatRoomRepository: IChatRoomRepository
  ) {}

  async execute(params: {
    model: string;
    session: IUserSession;
    name?: string;
  }): Promise<RoomResult> {
    try {
      // Validate session
      if (!params.session?.userId) {
        return {
          success: false,
          error: 'Invalid session: User ID is required'
        };
      }

      // Validate model
      if (!params.model) {
        return {
          success: false,
          error: 'Model is required'
        };
      }

      // Create room using repository
      const result = await this.chatRoomRepository.create(
        params.model,
        params.session,
        params.name
      );

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create chat room'
      };
    }
  }
}

import { Logger } from '../../../service/shared/utils/Logger';
import { IChatRoomRepository, UpdateRoomParams, UpdateRoomResult } from '../../interfaces';



export class UpdateRoomUseCase {
  constructor(
    private chatRoomRepository: IChatRoomRepository,
    private logger: Logger
  ) {}

  async execute(params: UpdateRoomParams): Promise<UpdateRoomResult> {
    try {
      Logger.info('UpdateRoomUseCase: Updating chat room', { 
        roomId: params.roomId,
        userId: params.session.user.id 
      });

      // Business validation
      if (!params.roomId || params.roomId.trim().length === 0) {
        return { success: false, error: 'Room ID is required' };
      }

      if (params.name && params.name.trim().length > 100) {
        return { success: false, error: 'Room name must be less than 100 characters' };
      }

      // Business rule: Validate model if provided
      if (params.model) {
        const validModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 'claude-3-haiku'];
        if (!validModels.includes(params.model)) {
          return { success: false, error: 'Invalid model selected' };
        }
      }

      // Business rule: Get existing room to verify ownership
      const existingRoom = await this.chatRoomRepository.getById(params.roomId, params.session);
      if (!existingRoom) {
        return { success: false, error: 'Room not found or access denied' };
      }

      // Business rule: Update room properties
      const updatedRoom = new ChatRoom({
        ...existingRoom,
        name: params.name?.trim() || existingRoom.name,
        model: params.model || existingRoom.model,
        updatedAt: new Date(),
      });

      // Business rule: Save updated room
      const result = await this.chatRoomRepository.update(updatedRoom, params.session);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      Logger.info('UpdateRoomUseCase: Room updated successfully', { 
        roomId: params.roomId,
        userId: params.session.user.id 
      });

      return { 
        success: true, 
        room: result.room 
      };

    } catch (error) {
      Logger.error('UpdateRoomUseCase: Failed to update room', { 
        error, 
        roomId: params.roomId,
        userId: params.session.user.id 
      });
      return { success: false, error: 'Failed to update room' };
    }
  }
}

import { ChatRoomRepository } from '../../../persistence/chat/repositories/ChatRoomRepository';
import { Logger } from '../../../service/shared/utils/Logger';
import { Session } from '@supabase/supabase-js';

export interface DeleteRoomParams {
  roomId: string;
  session: Session;
}

export interface DeleteRoomResult {
  success: boolean;
  error?: string;
}

export class DeleteRoomUseCase {
  constructor(
    private chatRoomRepository: ChatRoomRepository
  ) {}

  async execute(params: DeleteRoomParams): Promise<DeleteRoomResult> {
    try {
      Logger.info('DeleteRoomUseCase: Deleting chat room', { 
        roomId: params.roomId,
        userId: params.session.user.id 
      });

      // Business validation
      if (!params.roomId || params.roomId.trim().length === 0) {
        return { success: false, error: 'Room ID is required' };
      }

      // Business rule: Verify room exists and user has access
      const existingRoom = await this.chatRoomRepository.getById(params.roomId, params.session);
      if (!existingRoom) {
        return { success: false, error: 'Room not found or access denied' };
      }

      // Business rule: Verify ownership
      if (existingRoom.userId !== params.session.user.id) {
        return { success: false, error: 'Access denied: You can only delete your own rooms' };
      }

      // Business rule: Delete room (will cascade delete messages)
      const result = await this.chatRoomRepository.delete(params.roomId, params.session);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      Logger.info('DeleteRoomUseCase: Room deleted successfully', { 
        roomId: params.roomId,
        userId: params.session.user.id 
      });

      return { success: true };

    } catch (error) {
      Logger.error('DeleteRoomUseCase: Failed to delete room', { 
        error, 
        roomId: params.roomId,
        userId: params.session.user.id 
      });
      return { success: false, error: 'Failed to delete room' };
    }
  }
}

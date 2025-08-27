import { Session } from '@supabase/supabase-js';
import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { ChatRoom } from '../entities/ChatRoom';
import { IChatRoomRepository } from '../interfaces/IChatRoomRepository';

export interface CreateRoomParams {
  name?: string;
  model: string;
  session: Session;
}

export interface CreateRoomResult {
  success: boolean;
  room?: ChatRoom;
  error?: string;
}

export class CreateRoomUseCase {
  constructor(
    private chatRoomRepository: IChatRoomRepository,
    private logger: ILogger
  ) {}

  async execute(params: CreateRoomParams): Promise<CreateRoomResult> {
    try {
      this.logger.info('CreateRoomUseCase: Creating new chat room', { 
        userId: params.session.user.id, 
        model: params.model,
        name: params.name 
      });

      // Business validation
      if (!params.model || params.model.trim().length === 0) {
        return { success: false, error: 'Model is required' };
      }

      if (params.name && params.name.trim().length > 100) {
        return { success: false, error: 'Room name must be less than 100 characters' };
      }

      // Business rule: Validate model
      const validModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 'claude-3-haiku'];
      if (!validModels.includes(params.model)) {
        return { success: false, error: 'Invalid model selected' };
      }

      // Business rule: Create room
      const result = await this.chatRoomRepository.create(
        params.model,
        params.session,
        params.name
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      Logger.info('CreateRoomUseCase: Room created successfully', { 
        roomId: result.room?.id,
        userId: params.session.user.id 
      });

      return { 
        success: true, 
        room: result.room 
      };

    } catch (error) {
      this.logger.error('CreateRoomUseCase: Failed to create room', { 
        error, 
        userId: params.session.user.id 
      });
      return { success: false, error: 'Failed to create room' };
    }
  }
}

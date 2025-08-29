import { CreateRoomParams, CreateRoomResult, IChatRoomRepository } from '../../interfaces';


export class CreateRoomUseCase {
  constructor(
    private chatRoomRepository: IChatRoomRepository
  ) {}

  async execute(params: CreateRoomParams): Promise<CreateRoomResult> {
    try {
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

      return { 
        success: true, 
        room: result.room 
      };

    } catch {
      return { success: false, error: 'Failed to create room' };
    }
  }
}

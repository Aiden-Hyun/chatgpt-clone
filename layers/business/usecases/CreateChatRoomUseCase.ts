// Use case for creating a chat room - contains business logic
import { MessageValidator } from '../../services/validation/MessageValidator';
import { ChatRoomEntity } from '../entities/ChatRoom';
import { CreateRoomDTO, CreateRoomResultDTO } from '../dto/CreateRoomDTO';
import { IChatRoomRepository } from '../interfaces/IChatRoomRepository';

export class CreateChatRoomUseCase {
  constructor(
    private readonly chatRoomRepository: IChatRoomRepository
  ) {}

  async execute(request: CreateRoomDTO): Promise<CreateRoomResultDTO> {
    try {
      // Validate input
      const userValidation = MessageValidator.validateUserId(request.userId);
      if (!userValidation.isValid) {
        return {
          roomId: 0,
          model: '',
          createdAt: new Date(),
          success: false,
          error: userValidation.errors.join(', ')
        };
      }

      const modelValidation = MessageValidator.validateModel(request.model);
      if (!modelValidation.isValid) {
        return {
          roomId: 0,
          model: '',
          createdAt: new Date(),
          success: false,
          error: modelValidation.errors.join(', ')
        };
      }

      // Validate title if provided
      if (request.title && request.title.length > 100) {
        return {
          roomId: 0,
          model: '',
          createdAt: new Date(),
          success: false,
          error: 'Title too long (max 100 characters)'
        };
      }

      // Create the room
      const roomId = await this.chatRoomRepository.createRoom(
        request.userId,
        request.model,
        request.title
      );

      const now = new Date();
      
      return {
        roomId,
        title: request.title,
        model: request.model,
        createdAt: now,
        success: true
      };

    } catch (error) {
      console.error('CreateChatRoomUseCase error:', error);
      return {
        roomId: 0,
        model: '',
        createdAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

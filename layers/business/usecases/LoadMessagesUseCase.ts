// Use case for loading messages - contains business logic
import { MessageValidator } from '../../services/validation/MessageValidator';
import { ChatMessage } from '../entities/ChatMessage';
import { IMessageRepository } from '../interfaces/IMessageRepository';

export interface LoadMessagesRequest {
  roomId: number;
  userId: string;
}

export interface LoadMessagesResult {
  messages: ChatMessage[];
  success: boolean;
  error?: string;
}

export class LoadMessagesUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(request: LoadMessagesRequest): Promise<LoadMessagesResult> {
    try {
      // Validate input
      const roomValidation = MessageValidator.validateRoomId(request.roomId);
      if (!roomValidation.isValid) {
        return {
          messages: [],
          success: false,
          error: roomValidation.errors.join(', ')
        };
      }

      const userValidation = MessageValidator.validateUserId(request.userId);
      if (!userValidation.isValid) {
        return {
          messages: [],
          success: false,
          error: userValidation.errors.join(', ')
        };
      }

      // Load messages from repository
      const messages = await this.messageRepository.loadMessages(request.roomId);

      return {
        messages,
        success: true
      };

    } catch (error) {
      console.error('LoadMessagesUseCase error:', error);
      return {
        messages: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

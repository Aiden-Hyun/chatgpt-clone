// Use case for sending a message - contains business logic
import { MessageValidator } from '../../services/validation/MessageValidator';
import { generateMessageId } from '../../services/utils/idGenerator';
import { ChatMessageEntity } from '../entities/ChatMessage';
import { SendMessageDTO, SendMessageResultDTO } from '../dto/SendMessageDTO';
import { IAIProvider } from '../interfaces/IAIProvider';
import { IMessageRepository } from '../interfaces/IMessageRepository';

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly aiProvider: IAIProvider
  ) {}

  async execute(request: SendMessageDTO): Promise<SendMessageResultDTO> {
    try {
      // Validate input
      const validation = MessageValidator.validateMessage(request.content);
      if (!validation.isValid) {
        return {
          userMessage: { id: '', content: '', timestamp: new Date() },
          assistantMessage: { id: '', content: '', timestamp: new Date() },
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const modelValidation = MessageValidator.validateModel(request.model);
      if (!modelValidation.isValid) {
        return {
          userMessage: { id: '', content: '', timestamp: new Date() },
          assistantMessage: { id: '', content: '', timestamp: new Date() },
          success: false,
          error: modelValidation.errors.join(', ')
        };
      }

      const roomValidation = MessageValidator.validateRoomId(request.roomId);
      if (!roomValidation.isValid) {
        return {
          userMessage: { id: '', content: '', timestamp: new Date() },
          assistantMessage: { id: '', content: '', timestamp: new Date() },
          success: false,
          error: roomValidation.errors.join(', ')
        };
      }

      // Create user message entity
      const userMessage = new ChatMessageEntity(
        generateMessageId(),
        'user',
        request.content.trim()
      );

      // Load conversation history
      const existingMessages = await this.messageRepository.loadMessages(request.roomId);
      
      // Prepare conversation for AI
      const conversationMessages = [
        ...existingMessages,
        userMessage.toJSON()
      ];

      // Generate AI response
      const assistantContent = await this.aiProvider.generateResponse(
        conversationMessages,
        request.model
      );

      // Create assistant message entity
      const assistantMessage = new ChatMessageEntity(
        generateMessageId(),
        'assistant',
        assistantContent
      );

      // Save both messages
      await this.messageRepository.saveMessages(
        request.roomId,
        userMessage.toJSON(),
        assistantMessage.toJSON(),
        request.userId
      );

      return {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          timestamp: userMessage.timestamp
        },
        assistantMessage: {
          id: assistantMessage.id,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp
        },
        success: true
      };

    } catch (error) {
      console.error('SendMessageUseCase error:', error);
      return {
        userMessage: { id: '', content: '', timestamp: new Date() },
        assistantMessage: { id: '', content: '', timestamp: new Date() },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

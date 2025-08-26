import { MessageEntity, MessageRole } from '../entities/Message';
import { ChatRoomEntity } from '../entities/ChatRoom';
import { MessageRepository } from '../../../persistence/chat/repositories/MessageRepository';
import { ChatRoomRepository } from '../../../persistence/chat/repositories/ChatRoomRepository';
import { AIProvider } from '../../../persistence/chat/adapters/AIProvider';
import { MessageValidator } from '../../../service/chat/validators/MessageValidator';
import { IdGenerator } from '../../../service/chat/generators/IdGenerator';
import { Logger } from '../../../service/shared/utils/Logger';

export interface SendMessageParams {
  content: string;
  roomId: string;
  userId: string;
  model?: string;
}

export interface SendMessageResult {
  success: boolean;
  userMessage?: MessageEntity;
  assistantMessage?: MessageEntity;
  error?: string;
}

export class SendMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private chatRoomRepository: ChatRoomRepository,
    private aiProvider: AIProvider,
    private messageValidator: MessageValidator,
    private idGenerator: IdGenerator,
    private logger: Logger
  ) {}

  async execute(params: SendMessageParams): Promise<SendMessageResult> {
    try {
      this.logger.info('SendMessageUseCase: Starting message send', { roomId: params.roomId });

      // Validate input
      const validationResult = this.messageValidator.validateContent(params.content);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Check if room exists and user has access
      const room = await this.chatRoomRepository.getById(params.roomId);
      if (!room || room.userId !== params.userId) {
        return {
          success: false,
          error: 'Chat room not found or access denied'
        };
      }

      // Create user message
      const userMessage = new MessageEntity({
        id: this.idGenerator.generateMessageId(),
        content: params.content,
        role: MessageRole.USER,
        roomId: params.roomId,
        userId: params.userId
      });

      // Save user message
      await this.messageRepository.save(userMessage);

      // Update room with new message
      room.updateLastMessage(userMessage.id, userMessage.timestamp);
      await this.chatRoomRepository.update(room);

      // Get AI response
      const aiResponse = await this.aiProvider.sendMessage({
        content: params.content,
        roomId: params.roomId,
        model: params.model || 'gpt-3.5-turbo'
      });

      if (!aiResponse.success) {
        return {
          success: false,
          userMessage,
          error: aiResponse.error || 'Failed to get AI response'
        };
      }

      // Create assistant message
      const assistantMessage = new MessageEntity({
        id: this.idGenerator.generateMessageId(),
        content: aiResponse.content,
        role: MessageRole.ASSISTANT,
        roomId: params.roomId,
        metadata: {
          model: params.model || 'gpt-3.5-turbo',
          tokens: aiResponse.tokens,
          processingTime: aiResponse.processingTime
        }
      });

      // Save assistant message
      await this.messageRepository.save(assistantMessage);

      // Update room with assistant message
      room.updateLastMessage(assistantMessage.id, assistantMessage.timestamp);
      await this.chatRoomRepository.update(room);

      this.logger.info('SendMessageUseCase: Message sent successfully', {
        roomId: params.roomId,
        userMessageId: userMessage.id,
        assistantMessageId: assistantMessage.id
      });

      return {
        success: true,
        userMessage,
        assistantMessage
      };

    } catch (error) {
      this.logger.error('SendMessageUseCase: Error sending message', { error, roomId: params.roomId });
      return {
        success: false,
        error: 'Failed to send message'
      };
    }
  }
}

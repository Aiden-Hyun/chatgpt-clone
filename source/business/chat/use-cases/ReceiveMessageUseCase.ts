import { MessageEntity, MessageRole } from '../entities/Message';
import { MessageRepository } from '../../../persistence/chat/repositories/MessageRepository';
import { AIProvider } from '../../../persistence/chat/adapters/AIProvider';
import { IdGenerator } from '../../../service/chat/generators/IdGenerator';
import { Logger } from '../../../service/shared/utils/Logger';

export interface ReceiveMessageParams {
  roomId: string;
  userId: string;
  model?: string;
  context?: string;
}

export interface ReceiveMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

export class ReceiveMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private aiProvider: AIProvider,
    private idGenerator: IdGenerator,
    private logger: Logger
  ) {}

  async execute(params: ReceiveMessageParams): Promise<ReceiveMessageResult> {
    try {
      this.logger.info('ReceiveMessageUseCase: Starting message receive', { roomId: params.roomId });

      // Get conversation context
      const context = await this.buildContext(params.roomId, params.context);

      // Get AI response
      const aiResponse = await this.aiProvider.sendMessage({
        content: context,
        roomId: params.roomId,
        model: params.model || 'gpt-3.5-turbo'
      });

      if (!aiResponse.success) {
        return {
          success: false,
          error: aiResponse.error || 'Failed to receive AI response'
        };
      }

      // Create assistant message
      const message = new MessageEntity({
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

      // Save message
      await this.messageRepository.save(message);

      this.logger.info('ReceiveMessageUseCase: Message received successfully', {
        roomId: params.roomId,
        messageId: message.id
      });

      return {
        success: true,
        message
      };

    } catch (error) {
      this.logger.error('ReceiveMessageUseCase: Error receiving message', { error, roomId: params.roomId });
      return {
        success: false,
        error: 'Failed to receive message'
      };
    }
  }

  private async buildContext(roomId: string, customContext?: string): Promise<string> {
    if (customContext) {
      return customContext;
    }

    // Get recent messages for context
    const recentMessages = await this.messageRepository.getRecentByRoomId(roomId, 10);
    
    if (recentMessages.length === 0) {
      return 'Hello! How can I help you today?';
    }

    // Build context from recent messages
    const context = recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return context;
  }
}

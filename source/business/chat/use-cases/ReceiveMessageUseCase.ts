import { IIdGenerator } from '../../../service/chat/interfaces/IIdGenerator';
import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { IUserSession } from '../../shared/interfaces/IUserSession';
import { MessageEntity, MessageRole } from '../entities/Message';
import { IAIProvider } from '../interfaces/IAIProvider';
import { IMessageRepository } from '../interfaces/IMessageRepository';

export interface ReceiveMessageParams {
  roomId: string;
  userId: string;
  model?: string;
  context?: string;
  session: IUserSession;
  accessToken: string;
}

export interface ReceiveMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

export class ReceiveMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private aiProvider: IAIProvider,
    private idGenerator: IIdGenerator,
    private logger: ILogger
  ) {}

  async execute(params: ReceiveMessageParams): Promise<ReceiveMessageResult> {
    try {
      this.logger.info('ReceiveMessageUseCase: Starting message receive', { roomId: params.roomId });

      // Get conversation context
      const context = await this.buildContext(params.roomId, params.session, params.context);

      // Get AI response
      const aiResponse = await this.aiProvider.sendMessage({
        content: context,
        roomId: params.roomId,
        model: params.model || 'gpt-3.5-turbo',
        accessToken: params.accessToken
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
      await this.messageRepository.save(message, params.session);

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

  private async buildContext(roomId: string, session: Session, customContext?: string): Promise<string> {
    if (customContext) {
      return customContext;
    }

    // Get recent messages for context
    const recentMessages = await this.messageRepository.getRecentByRoomId(roomId, 10, session);
    
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

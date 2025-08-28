import { IIdGenerator } from '../../../service/chat/interfaces/IIdGenerator';
import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { IUserSession } from '../../shared/interfaces/IUserSession';
import { MessageEntity, MessageRole } from '../entities/Message';
import { IAIProvider } from '../interfaces/IAIProvider';
import { IChatRoomRepository } from '../interfaces/IChatRoomRepository';
import { IMessageRepository } from '../interfaces/IMessageRepository';

export interface ResendMessageParams {
  userMessageId: string;
  session: IUserSession;
  model?: string;
  accessToken: string;
}

export interface ResendMessageResult {
  success: boolean;
  assistantMessage?: MessageEntity;
  error?: string;
}

export class ResendMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private chatRoomRepository: IChatRoomRepository,
    private aiProvider: IAIProvider,
    private idGenerator: IIdGenerator,
    private logger: ILogger
  ) {}

  async execute(params: ResendMessageParams): Promise<ResendMessageResult> {
    try {
      this.logger.info('ResendMessageUseCase: Starting message resend', { 
        userMessageId: params.userMessageId 
      });

      // Get the user message
      const userMessage = await this.messageRepository.getById(params.userMessageId, params.session);
      if (!userMessage) {
        return {
          success: false,
          error: 'Message not found'
        };
      }

      // Verify it's a user message and user owns it
      if (!userMessage.isUserMessage() || userMessage.userId !== params.session.user.id) {
        return {
          success: false,
          error: 'Can only resend your own user messages'
        };
      }

      // Verify user has access to the room
      const room = await this.chatRoomRepository.getById(userMessage.roomId, params.session);
      if (!room || room.userId !== params.session.user.id) {
        return {
          success: false,
          error: 'Access denied to this chat room'
        };
      }

      // Build context up to and including this user message
      const context = await this.buildContextUpToMessage(userMessage.roomId, params.userMessageId, params.session);

      // Get AI response
      const aiResponse = await this.aiProvider.sendMessage({
        content: context,
        roomId: userMessage.roomId,
        model: params.model || 'gpt-3.5-turbo',
        accessToken: params.accessToken
      });

      if (!aiResponse.success) {
        return {
          success: false,
          error: aiResponse.error || 'Failed to get AI response'
        };
      }

      // Create assistant message linked to the user message
      const assistantMessage = new MessageEntity({
        id: this.idGenerator.generateMessageId(),
        content: aiResponse.content,
        role: MessageRole.ASSISTANT,
        roomId: userMessage.roomId,
        metadata: {
          model: params.model || 'gpt-3.5-turbo',
          tokens: aiResponse.tokens,
          processingTime: aiResponse.processingTime,
          replyToMessageId: params.userMessageId
        }
      });

      // Save assistant message
      const saveResult = await this.messageRepository.save(assistantMessage, params.session);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || 'Failed to save assistant message'
        };
      }

      // Update room with new message
      room.updateLastMessage(assistantMessage.id, assistantMessage.timestamp);
      await this.chatRoomRepository.update(room, params.session);

      this.logger.info('ResendMessageUseCase: Message resent successfully', {
        userMessageId: params.userMessageId,
        assistantMessageId: assistantMessage.id
      });

      return {
        success: true,
        assistantMessage
      };

    } catch (error) {
      this.logger.error('ResendMessageUseCase: Failed to resend message', { 
        error, 
        userMessageId: params.userMessageId 
      });
      return {
        success: false,
        error: 'Failed to resend message'
      };
    }
  }

  private async buildContextUpToMessage(roomId: string, untilMessageId: string, session: Session): Promise<string> {
    // Get all messages in the room
    const allMessages = await this.messageRepository.getByRoomId(roomId, session);
    
    // Find the index of the target message
    const targetIndex = allMessages.findIndex(msg => msg.id === untilMessageId);
    if (targetIndex === -1) {
      // If message not found, use recent messages as fallback
      const recentMessages = await this.messageRepository.getRecentByRoomId(roomId, 10, session);
      return recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
    }

    // Include all messages up to and including the target message
    const contextMessages = allMessages
      .slice(0, targetIndex + 1)
      .filter(msg => !msg.isDeleted);

    if (contextMessages.length === 0) {
      return 'Hello! How can I help you today?';
    }

    return contextMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }
}

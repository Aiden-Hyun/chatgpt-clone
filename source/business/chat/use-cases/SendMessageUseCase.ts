import { IIdGenerator } from '../../../service/chat/interfaces/IIdGenerator';
import { IMessageValidator } from '../../../service/chat/interfaces/IMessageValidator';
import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { IUserSession } from '../../interfaces';
import { MessageEntity, MessageRole } from '../../interfaces';
import { IAIProvider } from '../../interfaces';
import { IChatRoomRepository } from '../../interfaces';
import { IMessageRepository } from '../../interfaces';



export class SendMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private chatRoomRepository: IChatRoomRepository,
    private aiProvider: IAIProvider,
    private messageValidator: IMessageValidator,
    private idGenerator: IIdGenerator,
    private logger: ILogger
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
      const room = await this.chatRoomRepository.getById(params.roomId, params.session);
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
      await this.messageRepository.save(userMessage, params.session);

      // Update room with new message
      room.updateLastMessage(userMessage.id, userMessage.timestamp);
      await this.chatRoomRepository.update(room, params.session);

      // Get AI response
      const aiResponse = await this.aiProvider.sendMessage({
        content: params.content,
        roomId: params.roomId,
        model: params.model || 'gpt-3.5-turbo',
        accessToken: params.accessToken
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
      await this.messageRepository.save(assistantMessage, params.session);

      // Update room with assistant message
      room.updateLastMessage(assistantMessage.id, assistantMessage.timestamp);
      await this.chatRoomRepository.update(room, params.session);

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

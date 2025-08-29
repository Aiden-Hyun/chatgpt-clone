import { IMessageValidator } from '../../../service/chat/interfaces/IMessageValidator';
import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { EditMessageParams, EditMessageResult, IChatRoomRepository, IMessageRepository } from '../../interfaces';



export class EditMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private chatRoomRepository: IChatRoomRepository,
    private messageValidator: IMessageValidator,
    private logger: ILogger
  ) {}

  async execute(params: EditMessageParams): Promise<EditMessageResult> {
    try {
      this.logger.info('EditMessageUseCase: Starting message edit', { 
        messageId: params.messageId 
      });

      // Validate input
      const validationResult = this.messageValidator.validateContent(params.newContent);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Get the message
      const message = await this.messageRepository.getById(params.messageId, params.session);
      if (!message) {
        return {
          success: false,
          error: 'Message not found'
        };
      }

      // Check if user can edit this message
      if (!message.canBeEdited(params.session.user.id)) {
        return {
          success: false,
          error: 'You can only edit your own user messages'
        };
      }

      // Verify user has access to the room
      const room = await this.chatRoomRepository.getById(message.roomId, params.session);
      if (!room || room.userId !== params.session.user.id) {
        return {
          success: false,
          error: 'Access denied to this chat room'
        };
      }

      // Edit the message content
      message.editContent(params.newContent);

      // Save the updated message
      const saveResult = await this.messageRepository.update(message, params.session);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || 'Failed to save edited message'
        };
      }

      this.logger.info('EditMessageUseCase: Message edited successfully', {
        messageId: params.messageId,
        userId: params.session.user.id
      });

      return {
        success: true,
        message
      };

    } catch (error) {
      this.logger.error('EditMessageUseCase: Failed to edit message', { 
        error, 
        messageId: params.messageId 
      });
      return {
        success: false,
        error: 'Failed to edit message'
      };
    }
  }
}

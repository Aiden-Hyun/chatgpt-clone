import { ILogger } from '../../../service/interfaces/core';
import { DeleteMessageParams, DeleteMessageResult, IMessageRepository } from '../../interfaces';



export class DeleteMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private logger: ILogger
  ) {}

  async execute(params: DeleteMessageParams): Promise<DeleteMessageResult> {
    try {
      this.logger.info('DeleteMessageUseCase: Starting message deletion', { 
        messageId: params.messageId
      });

      // Get message
      const message = await this.messageRepository.getById(params.messageId, params.session);
      if (!message) {
        return {
          success: false,
          error: 'Message not found'
        };
      }

      // Check if message belongs to user
      if (message.userId !== params.session.userId) {
        return {
          success: false,
          error: 'Access denied: Cannot delete message from another user'
        };
      }

      // Check if message can be deleted
      if (!message.canBeDeleted()) {
        return {
          success: false,
          error: 'Message cannot be deleted'
        };
      }

      // Mark message as deleted
      message.markAsDeleted();

      // Save updated message
      await this.messageRepository.update(message, params.session);

      this.logger.info('DeleteMessageUseCase: Message deleted successfully', {
        messageId: params.messageId
      });

      return {
        success: true
      };

    } catch (error) {
      this.logger.error('DeleteMessageUseCase: Error deleting message', { 
        error, 
        messageId: params.messageId
      });
      return {
        success: false,
        error: 'Failed to delete message'
      };
    }
  }
}

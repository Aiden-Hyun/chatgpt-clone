import { MessageEntity } from '../entities/Message';
import { MessageRepository } from '../../../persistence/chat/repositories/MessageRepository';
import { Logger } from '../../../service/shared/utils/Logger';
import { Session } from '@supabase/supabase-js';

export interface DeleteMessageParams {
  messageId: string;
  userId: string;
  roomId: string;
  session: Session;
}

export interface DeleteMessageResult {
  success: boolean;
  message?: MessageEntity;
  error?: string;
}

export class DeleteMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private logger: Logger
  ) {}

  async execute(params: DeleteMessageParams): Promise<DeleteMessageResult> {
    try {
      this.logger.info('DeleteMessageUseCase: Starting message deletion', { 
        messageId: params.messageId,
        roomId: params.roomId 
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
      if (message.userId !== params.userId) {
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
        messageId: params.messageId,
        roomId: params.roomId
      });

      return {
        success: true,
        message
      };

    } catch (error) {
      this.logger.error('DeleteMessageUseCase: Error deleting message', { 
        error, 
        messageId: params.messageId,
        roomId: params.roomId 
      });
      return {
        success: false,
        error: 'Failed to delete message'
      };
    }
  }
}

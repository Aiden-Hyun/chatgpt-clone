import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { IUserSession } from '../../shared/interfaces/IUserSession';
import { MessageEntity } from '../entities/Message';
import { IClipboardAdapter } from '../interfaces/IClipboardAdapter';
import { IMessageRepository } from '../interfaces/IMessageRepository';

export interface CopyMessageParams {
  messageId: string;
  userId: string;
  roomId: string;
  session: IUserSession;
}

export interface CopyMessageResult {
  success: boolean;
  message?: MessageEntity;
  copiedContent?: string;
  error?: string;
}

export class CopyMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private clipboardAdapter: IClipboardAdapter,
    private logger: ILogger
  ) {}

  async execute(params: CopyMessageParams): Promise<CopyMessageResult> {
    try {
      this.logger.info('CopyMessageUseCase: Starting message copy', { 
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

      // Check if message can be copied
      if (!message.canBeCopied()) {
        return {
          success: false,
          error: 'Message cannot be copied'
        };
      }

      // Copy to clipboard
      const copyResult = await this.clipboardAdapter.copyToClipboard(message.content);
      if (!copyResult.success) {
        return {
          success: false,
          error: 'Failed to copy message to clipboard'
        };
      }

      this.logger.info('CopyMessageUseCase: Message copied successfully', {
        messageId: params.messageId,
        roomId: params.roomId
      });

      return {
        success: true,
        message,
        copiedContent: message.content
      };

    } catch (error) {
      this.logger.error('CopyMessageUseCase: Error copying message', { 
        error, 
        messageId: params.messageId,
        roomId: params.roomId 
      });
      return {
        success: false,
        error: 'Failed to copy message'
      };
    }
  }
}

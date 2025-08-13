// src/features/chat/services/interfaces/IMessageStateService.ts
import { ChatMessage } from '../types';

export interface IMessageStateService {
  /**
   * Update message state for new messages or regeneration
   */
  updateMessageState(args: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string;
  }): void;
  
  /**
   * Add error message to chat
   */
  addErrorMessage(message: string): void;

  /**
   * Mark an existing message as error by id and optionally set error content
   */
  markMessageErrorById(messageId: string, errorMessage?: string): void;
} 
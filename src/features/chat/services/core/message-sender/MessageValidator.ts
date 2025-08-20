import { Session } from '@supabase/supabase-js';
import { getModelInfo } from '../../../constants/models';
import { ChatMessage } from '../../../types';
import { generateMessageId } from '../../../utils/messageIdGenerator';
import { LoggingService } from '../LoggingService';

export interface SendMessageRequest {
  userContent: string;
  numericRoomId: number | null;
  messages: ChatMessage[];
  model: string;
  regenerateIndex?: number;
  originalAssistantContent?: string;
  session: Session;
  messageId?: string;
  isSearchMode?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  userMsg?: ChatMessage;
  assistantMsg?: ChatMessage;
}

export class MessageValidator {
  private readonly loggingService: LoggingService;

  constructor() {
    this.loggingService = new LoggingService('MessageValidator');
  }

  validateRequest(request: SendMessageRequest, requestId: string): ValidationResult {
    const { userContent, model, isSearchMode } = request;

    // Validate search mode is supported for this model
    if (isSearchMode) {
      const modelInfo = getModelInfo(model);
      if (!modelInfo?.capabilities.search) {
        const error = `Search is not supported for model: ${model}`;
        this.loggingService.error(`Search validation failed for request ${requestId}`, { error, model });
        return { isValid: false, error };
      }
    }

    // Validate user content
    if (!userContent || userContent.trim().length === 0) {
      const error = 'User content cannot be empty';
      this.loggingService.error(`User content validation failed for request ${requestId}`, { error });
      return { isValid: false, error };
    }

    // Create user and assistant message objects
    const userMsg: ChatMessage = { 
      role: 'user', 
      content: userContent,
      state: 'completed',           // User messages are immediately completed
      id: generateMessageId()
    };
    
    const assistantMsg: ChatMessage = { 
      role: 'assistant', 
      content: '', 
      state: 'loading',           // Start in loading state
      id: request.messageId || generateMessageId()     // Use provided ID or generate new one
    };

    this.loggingService.debug(`Validation passed for request ${requestId}`, {
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      contentLength: userContent.length
    });

    return {
      isValid: true,
      userMsg,
      assistantMsg
    };
  }
}

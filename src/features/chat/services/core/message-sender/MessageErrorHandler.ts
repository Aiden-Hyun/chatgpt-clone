import { generateMessageId } from "../../../utils/messageIdGenerator";
import { errorHandler } from "../../../../../shared/services/error";
import { IMessageStateService } from "../../interfaces/IMessageStateService";
import { ITypingStateService } from "../../interfaces/ITypingStateService";
import { LoggingService } from "../LoggingService";

export interface ErrorContext {
  requestId: string;
  assistantMessageId: string | null;
  duration: number;
  error: Error | unknown;
}

export class MessageErrorHandler {
  private readonly loggingService: LoggingService;

  constructor(
    private messageStateService: IMessageStateService,
    private typingStateService: ITypingStateService
  ) {
    this.loggingService = new LoggingService("MessageErrorHandler");
  }

  async handleError(context: ErrorContext): Promise<void> {
    const { requestId, assistantMessageId, duration, error } = context;

    // Use unified error handling system
    const processedError = await errorHandler.handle(error, {
      operation: 'sendMessage',
      service: 'chat',
      component: 'MessageErrorHandler',
      requestId,
      metadata: {
        assistantMessageId,
        duration,
        phase: 'message_send'
      }
    });

    // Update the existing assistant bubble instead of adding a new error message
    if (assistantMessageId) {
      this.messageStateService.markMessageErrorById(
        assistantMessageId,
        processedError.userMessage
      );
    } else {
      // Fallback: mark the last assistant loading bubble as error if id not available
      this.messageStateService.markLastAssistantLoadingAsError(
        processedError.userMessage
      );
    }

    // Clear typing state when error occurs
    this.typingStateService.setTyping(false);
  }

  async handleAIResponseError(
    requestId: string,
    assistantMessageId: string,
    error: string
  ): Promise<void> {
    // Create an Error object from the string for unified handling
    const errorObj = new Error(error);

    // Use unified error handling system
    const processedError = await errorHandler.handle(errorObj, {
      operation: 'aiResponse',
      service: 'chat',
      component: 'MessageErrorHandler',
      requestId,
      metadata: {
        assistantMessageId,
        phase: 'ai_response',
        errorType: 'ai_response_error'
      }
    });

    this.messageStateService.markMessageErrorById(
      assistantMessageId || generateMessageId(),
      processedError.userMessage
    );

    // Clear typing state when AI response error occurs
    this.typingStateService.setTyping(false);
  }

}

import { generateMessageId } from '../../../utils/messageIdGenerator';
import { IMessageStateService } from '../../interfaces/IMessageStateService';
import { LoggingService } from '../LoggingService';

export interface ErrorContext {
  requestId: string;
  assistantMessageId: string | null;
  duration: number;
  error: Error | unknown;
}

export class MessageErrorHandler {
  private readonly loggingService: LoggingService;

  constructor(
    private messageStateService: IMessageStateService
  ) {
    this.loggingService = new LoggingService('MessageErrorHandler');
  }

  handleError(context: ErrorContext): void {
    const { requestId, assistantMessageId, duration, error } = context;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    this.loggingService.error(`Message send failed for request ${requestId}`, {
      error: errorMessage,
      duration,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Update the existing assistant bubble instead of adding a new error message
    if (assistantMessageId) {
      this.messageStateService.markMessageErrorById(
        assistantMessageId,
        this.getErrorMessage(error)
      );
    } else {
      // Fallback: mark the last assistant loading bubble as error if id not available
      this.messageStateService.markLastAssistantLoadingAsError(
        this.getErrorMessage(error)
      );
    }
  }

  handleAIResponseError(requestId: string, assistantMessageId: string, error: string): void {
    this.loggingService.error(`AI response error for request ${requestId}`, { error });
    
    this.messageStateService.markMessageErrorById(
      assistantMessageId || generateMessageId(),
      `⚠️ ${error}`
    );
  }

  private getErrorMessage(error: Error | unknown): string {
    if (error instanceof Error && (error as any).name === 'TimeoutError') {
      return '⚠️ Request timed out. Please try again.';
    }
    return '⚠️ Error contacting AI.';
  }
}

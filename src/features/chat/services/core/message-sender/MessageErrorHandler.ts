import { generateMessageId } from "../../../utils/messageIdGenerator";
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

  handleError(context: ErrorContext): void {
    const { requestId, assistantMessageId, duration, error } = context;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.log(
      "🚨 [MessageErrorHandler] Handling error for request:",
      requestId,
      {
        errorMessage,
        duration,
        assistantMessageId,
      }
    );

    this.loggingService.error(`Message send failed for request ${requestId}`, {
      error: errorMessage,
      duration,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Update the existing assistant bubble instead of adding a new error message
    if (assistantMessageId) {
      console.log(
        "📝 [MessageErrorHandler] Marking specific message as error:",
        assistantMessageId
      );
      this.messageStateService.markMessageErrorById(
        assistantMessageId,
        this.getErrorMessage(error)
      );
    } else {
      // Fallback: mark the last assistant loading bubble as error if id not available
      console.log(
        "📝 [MessageErrorHandler] Marking last assistant loading message as error (fallback)"
      );
      this.messageStateService.markLastAssistantLoadingAsError(
        this.getErrorMessage(error)
      );
    }

    // Clear typing state when error occurs
    console.log("⌨️ [MessageErrorHandler] Clearing typing state due to error");
    this.typingStateService.setTyping(false);

    console.log("✅ [MessageErrorHandler] Error handling completed");
  }

  handleAIResponseError(
    requestId: string,
    assistantMessageId: string,
    error: string
  ): void {
    console.log(
      "🤖 [MessageErrorHandler] Handling AI response error for request:",
      requestId,
      {
        assistantMessageId,
        error,
      }
    );

    this.loggingService.error(`AI response error for request ${requestId}`, {
      error,
    });

    this.messageStateService.markMessageErrorById(
      assistantMessageId || generateMessageId(),
      error // Don't add prefix since error already includes it
    );

    // Clear typing state when AI response error occurs
    console.log(
      "⌨️ [MessageErrorHandler] Clearing typing state due to AI response error"
    );
    this.typingStateService.setTyping(false);

    console.log(
      "✅ [MessageErrorHandler] AI response error handling completed"
    );
  }

  private getErrorMessage(error: Error | unknown): string {
    if (
      error instanceof Error &&
      (error as { name?: string }).name === "TimeoutError"
    ) {
      return "⚠️ Request timed out. Please try again.";
    }
    return "⚠️ Error contacting AI.";
  }
}

import { errorHandler } from "../../../../../shared/services/error";
import {
  DEFAULT_RETRY_DELAY_MS,
  MESSAGE_SEND_MAX_RETRIES,
} from "../../../constants";
import { IAIApiService } from "../../interfaces/IAIApiService";
import { IAIResponseProcessor } from "../AIResponseProcessor";
import { LoggingService } from "../LoggingService";
import { RetryService } from "../RetryService";

import { MessageAnimation } from "./MessageAnimation";
import { MessagePersistence } from "./MessagePersistence";
import { MessageValidator, SendMessageRequest } from "./MessageValidator";

export interface SendMessageResult {
  success: boolean;
  roomId?: number;
  error?: string;
}

export class MessageOrchestrator {
  private readonly retryService: RetryService;
  private readonly loggingService: LoggingService;
  private readonly validator: MessageValidator;
  private readonly persistence: MessagePersistence;
  private readonly animation: MessageAnimation;

  constructor(
    private aiApiService: IAIApiService,
    private responseProcessor: IAIResponseProcessor,
    chatRoomService: unknown,
    messageService: unknown,
    animationService: unknown,
    messageStateService: unknown,
    typingStateService: unknown
  ) {
    this.retryService = new RetryService({
      maxRetries: MESSAGE_SEND_MAX_RETRIES,
      retryDelay: DEFAULT_RETRY_DELAY_MS,
      exponentialBackoff: true,
    });
    this.loggingService = new LoggingService("MessageOrchestrator");

    this.validator = new MessageValidator();
    this.persistence = new MessagePersistence(chatRoomService, messageService);
    this.animation = new MessageAnimation(
      animationService,
      messageStateService,
      typingStateService
    );
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const requestId = this.generateRequestId();
    let assistantMessageIdForError: string | null = null;

    try {
      // Step 1: Validate request and create message objects
      const validation = this.validator.validateRequest(request, requestId);
      if (!validation.isValid) {
        this.loggingService.error("Validation failed", {
          error: validation.error,
        });
        return {
          success: false,
          error: validation.error,
        };
      }

      const { userMsg, assistantMsg } = validation;
      assistantMessageIdForError = assistantMsg?.id ?? null;

      // Step 2: Update UI state
      this.animation.updateUIState({
        regenerateIndex: request.regenerateIndex,
        userMsg: userMsg!,
        assistantMsg: assistantMsg!,
        messageId: request.messageId,
        requestId,
      });

      // Step 3: Ensure room exists
      const { roomId, isNewRoom } = await this.persistence.createRoomIfNeeded(
        request.numericRoomId,
        request.session,
        request.model,
        requestId
      );

      // Step 4: Prepare messages for AI API
      const messagesWithSearch =
        request.regenerateIndex !== undefined
          ? request.messages
          : [...request.messages, userMsg!];

      const apiRequest = {
        roomId,
        messages: messagesWithSearch,
        model: request.model,
        clientMessageId: assistantMsg!.id,
        skipPersistence: true,
      };

      // Step 5: Get response from AI API with retry
      const apiResponse = await this.retryService.retryOperation(
        () =>
          this.aiApiService.sendMessage(
            apiRequest,
            request.session.access_token,
            request.isSearchMode
          ),
        "AI API call"
      );

      if (!this.responseProcessor.validateResponse(apiResponse)) {
        this.loggingService.error("AI response validation failed");
        const error = "Invalid AI response";

        // Use unified error handling system
        await errorHandler.handle(
          new Error("No valid response received from AI"),
          {
            operation: "aiResponseValidation",
            service: "chat",
            component: "MessageOrchestrator",
            requestId,
            metadata: {
              assistantMessageId: assistantMsg!.id || "",
              phase: "ai_response_validation",
              errorType: "validation_failed",
            },
          }
        );

        return { success: false, error };
      }

      const fullContent = this.responseProcessor.extractContent(apiResponse);
      if (!fullContent) {
        this.loggingService.error("No content in AI response");
        const error = "No content in AI response";

        // Use unified error handling system
        await errorHandler.handle(new Error("No content received from AI"), {
          operation: "aiResponseContent",
          service: "chat",
          component: "MessageOrchestrator",
          requestId,
          metadata: {
            assistantMessageId: assistantMsg!.id || "",
            phase: "ai_response_content",
            errorType: "empty_response",
          },
        });

        return { success: false, error };
      }

      // Step 6: Animate the response
      this.animation.animateResponse({
        fullContent,
        regenerateIndex: request.regenerateIndex,
        messageId: assistantMsg!.id,
        requestId,
      });

      // Step 7: Handle database operations asynchronously
      (async () => {
        try {
          await this.persistence.persistMessages({
            roomId,
            userMsg: userMsg!,
            assistantMsg: assistantMsg!,
            fullContent,
            regenerateIndex: request.regenerateIndex,
            originalAssistantContent: request.originalAssistantContent,
            session: request.session,
            requestId,
          });
        } catch (error) {
          this.loggingService.error("Step 7: Database operations failed", {
            error,
          });
          this.loggingService.error(
            `Error in post-animation operations for request ${requestId}`,
            { error }
          );
        }
      })();

      return { success: true, roomId };
    } catch (error) {
      this.loggingService.error("Message send failed", { error });

      // Use unified error handling system
      const processedError = await errorHandler.handle(error, {
        operation: "sendMessage",
        service: "chat",
        component: "MessageOrchestrator",
        requestId,
        metadata: {
          assistantMessageId: assistantMessageIdForError,
          phase: "message_send",
        },
      });

      return {
        success: false,
        error: processedError.userMessage,
      };
    } finally {
      // Always clear typing state when operation completes or fails
      this.animation.clearTypingState();
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

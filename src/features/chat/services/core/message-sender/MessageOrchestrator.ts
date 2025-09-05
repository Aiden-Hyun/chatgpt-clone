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
  duration?: number;
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
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    let assistantMessageIdForError: string | null = null;

    this.loggingService.info("Starting message send orchestration", {
      requestId,
      model: request.model,
      isSearchMode: request.isSearchMode,
      messageCount: request.messages.length,
    });

    try {
      this.loggingService.debug("Starting message send with search mode", {
        isSearchMode: request.isSearchMode,
      });
      this.loggingService.info(`Starting message send request ${requestId}`, {
        requestId,
        messageId: request.messageId,
        roomId: request.numericRoomId,
        model: request.model,
        regenerateIndex: request.regenerateIndex,
        messageCount: request.messages.length,
      });

      // Step 1: Validate request and create message objects
      this.loggingService.debug("Step 1: Validating request");
      const validation = this.validator.validateRequest(request, requestId);
      if (!validation.isValid) {
        this.loggingService.error("Validation failed", {
          error: validation.error,
        });
        return {
          success: false,
          error: validation.error,
          duration: Date.now() - startTime,
        };
      }
      this.loggingService.debug("Step 1: Validation passed");

      const { userMsg, assistantMsg } = validation;
      assistantMessageIdForError = assistantMsg?.id ?? null;

      // Step 2: Update UI state
      this.loggingService.debug("Step 2: Updating UI state");
      this.animation.updateUIState({
        regenerateIndex: request.regenerateIndex,
        userMsg: userMsg!,
        assistantMsg: assistantMsg!,
        messageId: request.messageId,
        requestId,
      });
      this.loggingService.debug("Step 2: UI state updated");

      // Step 3: Ensure room exists
      this.loggingService.debug("Step 3: Ensuring room exists");
      const { roomId, isNewRoom } = await this.persistence.createRoomIfNeeded(
        request.numericRoomId,
        request.session,
        request.model,
        requestId
      );
      this.loggingService.debug("Step 3: Room ready", {
        roomId,
        isNewRoom,
      });

      // Step 4: Prepare messages for AI API
      this.loggingService.debug("Step 4: Preparing AI API request");
      const messagesWithSearch =
        request.regenerateIndex !== undefined
          ? request.messages
          : [...request.messages, userMsg!];

      this.loggingService.debug("Preparing AI request", {
        messageCount: messagesWithSearch.length,
      });

      const apiRequest = {
        roomId,
        messages: messagesWithSearch,
        model: request.model,
        clientMessageId: assistantMsg!.id,
        skipPersistence: true,
      };

      this.loggingService.debug(`Sending AI API request ${requestId}`, {
        messageCount: messagesWithSearch.length,
        model: request.model,
      });

      // Step 5: Get response from AI API with retry
      this.loggingService.debug("Step 5: Sending AI API request");
      const apiResponse = await this.retryService.retryOperation(
        () =>
          this.aiApiService.sendMessage(
            apiRequest,
            request.session.access_token,
            request.isSearchMode
          ),
        "AI API call"
      );
      this.loggingService.debug("Step 5: AI API response received");

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

        return { success: false, error, duration: Date.now() - startTime };
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

        return { success: false, error, duration: Date.now() - startTime };
      }

      this.loggingService.debug("AI response content extracted", {
        contentLength: fullContent.length,
      });
      this.loggingService.info(
        `AI response received for request ${requestId}`,
        {
          contentLength: fullContent.length,
          model: apiResponse.model,
        }
      );

      // Step 6: Animate the response
      this.loggingService.debug("Step 6: Starting response animation");
      this.animation.animateResponse({
        fullContent,
        regenerateIndex: request.regenerateIndex,
        messageId: assistantMsg!.id,
        requestId,
      });
      this.loggingService.debug("Step 6: Animation started");

      // Step 7: Handle database operations asynchronously
      this.loggingService.debug("Step 7: Starting async database operations");
      (async () => {
        try {
          this.loggingService.debug(
            `Starting post-animation operations for request ${requestId}`
          );

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

          this.loggingService.info(
            `Post-animation operations completed for request ${requestId}`
          );
          this.loggingService.debug("Step 7: Database operations completed");
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

      const duration = Date.now() - startTime;
      this.loggingService.info("Message send completed successfully", {
        duration,
        roomId,
        isNewRoom,
      });
      this.loggingService.info(
        `Message send completed successfully for request ${requestId}`,
        {
          duration,
          roomId,
          isNewRoom,
        }
      );

      return { success: true, roomId, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.loggingService.error("Message send failed", { error });

      // Use unified error handling system
      const processedError = await errorHandler.handle(error, {
        operation: "sendMessage",
        service: "chat",
        component: "MessageOrchestrator",
        requestId,
        metadata: {
          assistantMessageId: assistantMessageIdForError,
          duration,
          phase: "message_send",
        },
      });

      return {
        success: false,
        error: processedError.userMessage,
        duration,
      };
    } finally {
      // Always clear typing state when operation completes or fails
      this.loggingService.debug("Final cleanup: clearing typing state");
      this.animation.clearTypingState();
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

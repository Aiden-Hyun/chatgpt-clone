import {
  DEFAULT_RETRY_DELAY_MS,
  MESSAGE_SEND_MAX_RETRIES,
} from "../../../constants";
import { IAIApiService } from "../../interfaces/IAIApiService";
import { IAIResponseProcessor } from "../AIResponseProcessor";
import { LoggingService } from "../LoggingService";
import { RetryService } from "../RetryService";

import { MessageAnimation } from "./MessageAnimation";
import { MessageErrorHandler } from "./MessageErrorHandler";
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
  private readonly errorHandler: MessageErrorHandler;

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
    this.errorHandler = new MessageErrorHandler(
      messageStateService,
      typingStateService
    );
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    let assistantMessageIdForError: string | null = null;

    console.log(
      "🎯 [MessageOrchestrator] Starting message send orchestration for request:",
      requestId,
      {
        model: request.model,
        isSearchMode: request.isSearchMode,
        messageCount: request.messages.length,
      }
    );

    try {
      console.log(
        "🔍 [MessageOrchestrator] Starting message send with isSearchMode:",
        request.isSearchMode
      );
      this.loggingService.info(`Starting message send request ${requestId}`, {
        requestId,
        messageId: request.messageId,
        roomId: request.numericRoomId,
        model: request.model,
        regenerateIndex: request.regenerateIndex,
        messageCount: request.messages.length,
      });

      // Step 1: Validate request and create message objects
      console.log("🔍 [MessageOrchestrator] Step 1: Validating request...");
      const validation = this.validator.validateRequest(request, requestId);
      if (!validation.isValid) {
        console.error(
          "❌ [MessageOrchestrator] Validation failed:",
          validation.error
        );
        return {
          success: false,
          error: validation.error,
          duration: Date.now() - startTime,
        };
      }
      console.log("✅ [MessageOrchestrator] Step 1: Validation passed");

      const { userMsg, assistantMsg } = validation;
      assistantMessageIdForError = assistantMsg?.id ?? null;

      // Step 2: Update UI state
      console.log("🎭 [MessageOrchestrator] Step 2: Updating UI state...");
      this.animation.updateUIState({
        regenerateIndex: request.regenerateIndex,
        userMsg: userMsg!,
        assistantMsg: assistantMsg!,
        messageId: request.messageId,
        requestId,
      });
      console.log("✅ [MessageOrchestrator] Step 2: UI state updated");

      // Step 3: Ensure room exists
      console.log("🏗️ [MessageOrchestrator] Step 3: Ensuring room exists...");
      const { roomId, isNewRoom } = await this.persistence.createRoomIfNeeded(
        request.numericRoomId,
        request.session,
        request.model,
        requestId
      );
      console.log("✅ [MessageOrchestrator] Step 3: Room ready:", {
        roomId,
        isNewRoom,
      });

      // Step 4: Prepare messages for AI API
      console.log(
        "🤖 [MessageOrchestrator] Step 4: Preparing AI API request..."
      );
      const messagesWithSearch =
        request.regenerateIndex !== undefined
          ? request.messages
          : [...request.messages, userMsg!];

      console.log("🔍 [MessageOrchestrator] Preparing AI request:", {
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
      console.log("🚀 [MessageOrchestrator] Step 5: Sending AI API request...");
      const apiResponse = await this.retryService.retryOperation(
        () =>
          this.aiApiService.sendMessage(
            apiRequest,
            request.session.access_token,
            request.isSearchMode
          ),
        "AI API call"
      );
      console.log("✅ [MessageOrchestrator] Step 5: AI API response received");

      if (!this.responseProcessor.validateResponse(apiResponse)) {
        console.error("❌ [MessageOrchestrator] AI response validation failed");
        const error = "Invalid AI response";
        await this.errorHandler.handleAIResponseError(
          requestId,
          assistantMsg!.id || "",
          "⚠️ No valid response received from AI."
        );
        return { success: false, error, duration: Date.now() - startTime };
      }

      const fullContent = this.responseProcessor.extractContent(apiResponse);
      if (!fullContent) {
        console.error("❌ [MessageOrchestrator] No content in AI response");
        const error = "No content in AI response";
        await this.errorHandler.handleAIResponseError(
          requestId,
          assistantMsg!.id || "",
          "⚠️ No content received from AI."
        );
        return { success: false, error, duration: Date.now() - startTime };
      }

      console.log(
        "✅ [MessageOrchestrator] AI response content extracted, length:",
        fullContent.length
      );
      this.loggingService.info(
        `AI response received for request ${requestId}`,
        {
          contentLength: fullContent.length,
          model: apiResponse.model,
        }
      );

      // Step 6: Animate the response
      console.log(
        "🎬 [MessageOrchestrator] Step 6: Starting response animation..."
      );
      this.animation.animateResponse({
        fullContent,
        regenerateIndex: request.regenerateIndex,
        messageId: assistantMsg!.id,
        requestId,
      });
      console.log("✅ [MessageOrchestrator] Step 6: Animation started");

      // Step 7: Handle database operations asynchronously
      console.log(
        "💾 [MessageOrchestrator] Step 7: Starting async database operations..."
      );
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
          console.log(
            "✅ [MessageOrchestrator] Step 7: Database operations completed"
          );
        } catch (error) {
          console.error(
            "❌ [MessageOrchestrator] Step 7: Database operations failed:",
            error
          );
          this.loggingService.error(
            `Error in post-animation operations for request ${requestId}`,
            { error }
          );
        }
      })();

      const duration = Date.now() - startTime;
      console.log(
        "🎉 [MessageOrchestrator] Message send completed successfully:",
        { duration, roomId, isNewRoom }
      );
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
      console.error("❌ [MessageOrchestrator] Message send failed:", error);

      // Use unified error handling system
      await this.errorHandler.handleError({
        requestId,
        assistantMessageId: assistantMessageIdForError,
        duration,
        error,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      };
    } finally {
      // Always clear typing state when operation completes or fails
      console.log(
        "⌨️ [MessageOrchestrator] Final cleanup: clearing typing state"
      );
      this.animation.clearTypingState();
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

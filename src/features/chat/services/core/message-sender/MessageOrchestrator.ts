import { errorHandler } from "../../../../../shared/services/error";
import type { ChatMessage } from "@/entities/message";

import { getLogger } from "../../../../../shared/services/logger";
import {
  DEFAULT_RETRY_DELAY_MS,
  MESSAGE_SEND_MAX_RETRIES,
} from "../../../constants";
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
  private readonly logger = getLogger("MessageOrchestrator");
  private readonly validator: MessageValidator;
  private readonly persistence: MessagePersistence;
  private readonly animation: MessageAnimation;

  constructor(
    private sendMessageFn: (request: any, accessToken: string, isSearchMode?: boolean) => Promise<any>,
    private responseProcessor: { validateResponse: (response: any) => boolean; extractContent: (response: any) => string | null },
    chatRoomService: any,
    messageService: any,
    animationService: any,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    typingStateService: any
  ) {
    this.retryService = new RetryService({
      maxRetries: MESSAGE_SEND_MAX_RETRIES,
      retryDelay: DEFAULT_RETRY_DELAY_MS,
      exponentialBackoff: true,
    });

    this.validator = new MessageValidator();
    this.persistence = new MessagePersistence(chatRoomService, messageService);
    this.animation = new MessageAnimation(
      animationService,
      setMessages,
      typingStateService
    );
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const requestId = this.generateRequestId();
    let assistantMessageIdForError: string | null = null;

    try {
      // Step 1: Validate request and create message objects
      this.logger.info("Validating message request", { requestId });
      const validation = this.validator.validateRequest(request, requestId);
      if (!validation.isValid) {
        this.logger.error("Message validation failed", {
          requestId,
          error: validation.error,
        });
        return {
          success: false,
          error: validation.error,
        };
      }
      this.logger.info("Message validation passed", { requestId });

      const { userMsg, assistantMsg } = validation;
      assistantMessageIdForError = assistantMsg?.id ?? null;

      // Step 2: Update UI state
      this.logger.debug(
        `Updating UI state for message ${request.messageId} (regeneration: ${
          request.regenerateIndex !== undefined ? "yes" : "no"
        })`,
        {
          requestId,
          messageId: request.messageId,
          isRegeneration: request.regenerateIndex !== undefined,
        }
      );

      this.animation.updateUIState({
        regenerateIndex: request.regenerateIndex,
        userMsg: userMsg!,
        assistantMsg: assistantMsg!,
        messageId: request.messageId,
        requestId,
      });

      // Step 3: Ensure room exists
      this.logger.debug(
        `Ensuring chat room exists for room ${
          request.numericRoomId || "new"
        } with model ${request.model}`,
        {
          requestId,
          roomId: request.numericRoomId,
          model: request.model,
        }
      );

      const { roomId } = await this.persistence.createRoomIfNeeded(
        request.numericRoomId,
        request.session,
        request.model,
        requestId
      );

      // Step 4: Prepare messages for AI API
      this.logger.debug(
        `Preparing API request for room ${roomId} with ${
          request.messages.length
        } messages (regeneration: ${
          request.regenerateIndex !== undefined ? "yes" : "no"
        })`,
        {
          requestId,
          roomId,
          messageCount: request.messages.length,
          isRegeneration: request.regenerateIndex !== undefined,
        }
      );

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
      this.logger.info(
        `Starting network request to AI API for room ${roomId} with model ${request.model}`
      );
      const apiResponse = await this.retryService.retryOperation(
        () =>
          this.sendMessageFn(
            apiRequest,
            request.session.access_token,
            request.isSearchMode
          ),
        "AI API call"
      );
      this.logger.info(
        `Network request to AI API completed (response: ${
          !!apiResponse ? "received" : "none"
        })`
      );

      if (!this.responseProcessor.validateResponse(apiResponse)) {
        this.logger.error("AI response validation failed");
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
        this.logger.error("No content in AI response");
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
          this.logger.error("Database operations failed", {
            requestId,
            error: (error as Error).message,
          });
        }
      })();

      return { success: true, roomId };
    } catch (error) {
      this.logger.error("Message send failed", { error: (error as Error).message });

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

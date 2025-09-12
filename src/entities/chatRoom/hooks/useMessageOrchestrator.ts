import type { ChatMessage } from "@/entities/message";
import { useCallback, useMemo } from "react";

import {
  DEFAULT_RETRY_DELAY_MS,
  MESSAGE_SEND_MAX_RETRIES,
} from "@/features/chat/constants";
import { generateMessageId } from "@/features/chat/utils/messageIdGenerator";
import { errorHandler } from "@/shared/services/error";
import { getLogger } from "@/shared/services/logger";

// Import all the service classes (keeping them as classes)
import { RetryService } from "@/features/chat/services/core/RetryService";
import { ServiceRegistry } from "@/features/chat/services/core/ServiceRegistry";
import { MessageAnimation } from "@/features/chat/services/core/message-sender/MessageAnimation";
import { MessagePersistence } from "@/features/chat/services/core/message-sender/MessagePersistence";
import { MessageValidator } from "@/features/chat/services/core/message-sender/MessageValidator";

// Inlined from AIResponseProcessor
const validateResponse = (response: any): boolean => {
  // Handle search responses (direct content format)
  if (response.content) {
    return true;
  }

  // Handle chat responses (choices format)
  if (!response || !response.choices || !Array.isArray(response.choices)) {
    return false;
  }

  const firstChoice = response.choices[0];
  if (!firstChoice || !firstChoice.message || !firstChoice.message.content) {
    return false;
  }

  return true;
};

const extractContent = (response: any): string | null => {
  if (!validateResponse(response)) {
    return null;
  }

  // Handle search responses (direct content format)
  if (response.content) {
    return response.content;
  }

  // Handle chat responses (choices format)
  return response.choices![0].message.content;
};

export interface UseMessageOrchestratorProps {
  roomId: number | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  selectedModel: string;
  isSearchMode?: boolean;
}

export interface SendMessageResult {
  success: boolean;
  roomId?: number;
  error?: string;
}

export const useMessageOrchestrator = ({
  roomId,
  messages,
  setMessages,
  selectedModel,
  isSearchMode = false,
}: UseMessageOrchestratorProps) => {
  const logger = getLogger("useMessageOrchestrator");

  // ✅ MEMOIZED SERVICES: Create services once, reuse across renders
  const services = useMemo(() => {
    logger.debug("Creating message orchestrator services", {
      roomId: roomId || "new",
      model: selectedModel,
      isSearchMode,
    });

    return {
      retryService: new RetryService({
        maxRetries: MESSAGE_SEND_MAX_RETRIES,
        retryDelay: DEFAULT_RETRY_DELAY_MS,
        exponentialBackoff: true,
      }),
      validator: new MessageValidator(),
      persistence: new MessagePersistence(
        ServiceRegistry.createChatRoomService(),
        ServiceRegistry.createMessageService()
      ),
      animation: new MessageAnimation(
        ServiceRegistry.createAnimationService(setMessages),
        ServiceRegistry.createMessageStateService(setMessages),
        ServiceRegistry.createTypingStateService(() => {}) // No-op for typing
      ),
      aiApiService: ServiceRegistry.createAIApiService(),
      responseProcessor: { validateResponse, extractContent },
    };
  }, [setMessages]); // Only recreate if setMessages changes

  // ✅ STABLE REQUEST ID GENERATOR
  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ✅ MAIN SEND MESSAGE FUNCTION
  const sendMessage = useCallback(
    async (userContent: string): Promise<SendMessageResult> => {
      if (!userContent.trim()) {
        logger.warn("Attempted to send empty message");
        return { success: false, error: "Message content cannot be empty" };
      }

      const requestId = generateRequestId();
      let assistantMessageIdForError: string | null = null;

      logger.info("Starting message send process", {
        requestId,
        roomId: roomId || "new",
        model: selectedModel,
        isSearchMode,
        contentLength: userContent.length,
      });

      try {
        // Step 1: Validate request and create message objects
        logger.debug("Validating message request", { requestId });

        // Get user session
        const authService = ServiceRegistry.createAuthService();
        const session = await authService.getSession();

        if (!session) {
          logger.warn("No active session, aborting message send", {
            requestId,
          });
          return { success: false, error: "User not authenticated" };
        }

        const validation = services.validator.validateRequest(
          {
            userContent: userContent.trim(),
            numericRoomId: roomId,
            messages,
            model: selectedModel,
            isSearchMode,
            session,
            messageId: generateMessageId(),
          },
          requestId
        );

        if (!validation.isValid) {
          logger.error("Message validation failed", {
            requestId,
            error: validation.error,
          });
          return {
            success: false,
            error: validation.error,
          };
        }
        logger.debug("Message validation passed", { requestId });

        const { userMsg, assistantMsg } = validation;
        assistantMessageIdForError = assistantMsg?.id ?? null;

        // Step 2: Update UI state
        logger.debug(`Updating UI state for message ${assistantMsg?.id}`, {
          requestId,
          messageId: assistantMsg?.id,
        });

        services.animation.updateUIState({
          regenerateIndex: undefined,
          userMsg: userMsg!,
          assistantMsg: assistantMsg!,
          messageId: assistantMsg?.id,
          requestId,
        });

        // Step 3: Ensure room exists
        logger.debug(
          `Ensuring chat room exists for room ${
            roomId || "new"
          } with model ${selectedModel}`,
          {
            requestId,
            roomId,
            model: selectedModel,
          }
        );

        const { roomId: finalRoomId } =
          await services.persistence.createRoomIfNeeded(
            roomId,
            session,
            selectedModel,
            requestId
          );

        // Step 4: Prepare messages for AI API
        logger.debug(
          `Preparing API request for room ${finalRoomId} with ${messages.length} messages`,
          {
            requestId,
            roomId: finalRoomId,
            messageCount: messages.length,
          }
        );

        const messagesWithSearch = [...messages, userMsg!];

        const apiRequest = {
          roomId: finalRoomId,
          messages: messagesWithSearch,
          model: selectedModel,
          clientMessageId: assistantMsg!.id,
          skipPersistence: true,
        };

        // Step 5: Get response from AI API with retry
        logger.info(
          `Starting network request to AI API for room ${finalRoomId} with model ${selectedModel}`
        );

        const apiResponse = await services.retryService.retryOperation(
          () =>
            services.aiApiService.sendMessage(
              apiRequest,
              session.access_token,
              isSearchMode
            ),
          "AI API call"
        );

        logger.info(
          `Network request to AI API completed (response: ${
            !!apiResponse ? "received" : "none"
          })`
        );

        // Step 6: Validate and process response
        if (!services.responseProcessor.validateResponse(apiResponse)) {
          logger.error("AI response validation failed", { requestId });
          const error = "Invalid AI response";

          await errorHandler.handle(
            new Error("No valid response received from AI"),
            {
              operation: "aiResponseValidation",
              service: "chat",
              component: "useMessageOrchestrator",
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

        const fullContent =
          services.responseProcessor.extractContent(apiResponse);
        if (!fullContent) {
          logger.error("No content in AI response", { requestId });
          const error = "No content in AI response";

          await errorHandler.handle(new Error("No content received from AI"), {
            operation: "aiResponseContent",
            service: "chat",
            component: "useMessageOrchestrator",
            requestId,
            metadata: {
              assistantMessageId: assistantMsg!.id || "",
              phase: "ai_response_content",
              errorType: "empty_response",
            },
          });

          return { success: false, error };
        }

        // Step 7: Animate the response
        logger.debug("Animating AI response", { requestId });
        services.animation.animateResponse({
          fullContent,
          regenerateIndex: undefined,
          messageId: assistantMsg!.id,
          requestId,
        });

        // Step 8: Handle database operations asynchronously
        logger.debug("Starting async database persistence", { requestId });
        (async () => {
          try {
            await services.persistence.persistMessages({
              roomId: finalRoomId,
              userMsg: userMsg!,
              assistantMsg: assistantMsg!,
              fullContent,
              regenerateIndex: undefined,
              originalAssistantContent: undefined,
              session,
              requestId,
            });
            logger.debug("Database persistence completed", { requestId });
          } catch (error) {
            logger.error("Database operations failed", {
              requestId,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        })();

        logger.info("Message send completed successfully", {
          requestId,
          roomId: finalRoomId,
          model: selectedModel,
          contentLength: fullContent.length,
        });

        return { success: true, roomId: finalRoomId };
      } catch (error) {
        logger.error("Message send failed", {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Use unified error handling system
        const processedError = await errorHandler.handle(error, {
          operation: "sendMessage",
          service: "chat",
          component: "useMessageOrchestrator",
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
        logger.debug("Clearing typing state", { requestId });
        services.animation.clearTypingState();
      }
    },
    [
      roomId,
      messages,
      selectedModel,
      isSearchMode,
      services,
      generateRequestId,
      logger,
    ]
  );

  return {
    sendMessage,
  };
};

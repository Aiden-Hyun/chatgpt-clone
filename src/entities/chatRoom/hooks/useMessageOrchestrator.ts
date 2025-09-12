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
import { appConfig } from "@/shared/lib/config";
import { getSession } from "@/shared/lib/supabase/getSession";
import { fetchJson } from "@/features/chat/lib/fetch";
import { getModelInfo } from "@/features/chat/constants/models";
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

// Inlined from ChatAPIService
const sendMessageToAPI = async (
  request: any,
  accessToken: string,
  isSearchMode?: boolean
): Promise<any> => {
  const logger = getLogger("ChatAPIService");
  
  // Get model configuration from client-side models
  const modelInfo = getModelInfo(request.model);

  // Validate search mode is supported for this model
  if (isSearchMode && !modelInfo?.capabilities.search) {
    throw new Error(`Search is not supported for model: ${request.model}`);
  }

  // Consolidated from legacy/fetchOpenAIResponse.ts with abort + timeout support via fetchJson
  const payload = isSearchMode
    ? {
        question:
          request.messages[request.messages.length - 1]?.content || "",
        model: request.model,
        modelConfig: {
          tokenParameter: modelInfo?.tokenParameter || "max_tokens",
          supportsCustomTemperature:
            modelInfo?.supportsCustomTemperature ?? true,
          defaultTemperature: modelInfo?.defaultTemperature || 0.7,
        },
      }
    : {
        roomId: request.roomId,
        messages: request.messages,
        model: request.model,
        modelConfig: {
          tokenParameter: modelInfo?.tokenParameter || "max_tokens",
          supportsCustomTemperature:
            modelInfo?.supportsCustomTemperature ?? true,
          defaultTemperature: modelInfo?.defaultTemperature || 0.7,
        },
        // Include idempotency and persistence control so the edge function can upsert reliably
        clientMessageId: request.clientMessageId,
        skipPersistence: request.skipPersistence,
      };

  logger.info(
    `Making API call for ${
      isSearchMode ? "search" : "chat"
    } mode with model ${request.model} (${
      request.messages.length
    } messages, room ${request.roomId})`
  );

  logger.debug(
    `Request payload details: clientMessageId ${request.clientMessageId}, skipPersistence ${request.skipPersistence}`
  );

  const url = isSearchMode
    ? `${appConfig.edgeFunctionBaseUrl}/react-search`
    : `${appConfig.edgeFunctionBaseUrl}/ai-chat`;
  const response = await fetchJson<any>(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  logger.info(
    `Received API response for ${
      isSearchMode ? "search" : "chat"
    } mode with model ${request.model} (response: ${
      !!response ? "received" : "none"
    })`
  );

  // Transform search response to match AIApiResponse format
  if (isSearchMode) {
    const searchResponse = response as {
      final_answer_md: string;
      citations: unknown[];
      time_warning?: string;
    };
    return {
      content: searchResponse.final_answer_md,
      model: request.model, // Use the actual model instead of hardcoded 'react-search'
      citations: searchResponse.citations,
      time_warning: searchResponse.time_warning,
    };
  }

  return response;
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
        setMessages,
        { setTyping: () => {} } // No-op for typing - direct object
      ),
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

        // Get user session directly
        const session = await getSession();

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
            sendMessageToAPI(
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

// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useEffect, useMemo } from "react";

import { useChatRoomSearch } from "@/entities/chatRoom";
import { useMessageInput, useRegenerationService } from "@/entities/message";
import { errorHandler } from "@/shared/services/error";
import { getLogger } from "@/shared/services/logger";

import { getModelInfo } from "../../constants/models";
import { SendMessageRequest } from "../../services/core/message-sender";
import { ServiceFactory } from "../../services/core/ServiceFactory";
import { ServiceRegistry } from "../../services/core/ServiceRegistry";
import { generateMessageId } from "../../utils/messageIdGenerator";

import { useChatState } from "./useChatState";

type UseChatOptions = {
  selectedModel?: string;
  setModel?: (model: string) => void | Promise<void>;
  isSearchMode?: boolean;
  onSearchToggle?: () => void;
};

export const useChat = (
  numericRoomId: number | null,
  options?: UseChatOptions
) => {
  const logger = getLogger("useChat");

  // Core state management
  const chatState = useChatState(numericRoomId);
  const {
    messages,
    loading,
    regeneratingIndices,
    getLoadingMessages,
    getAnimatingMessages,
    isNewMessageLoading,
    setMessages,
    startRegenerating,
    stopRegenerating,
    isRegenerating,
  } = chatState;

  // Compute derived state
  const sending = getLoadingMessages().length > 0;
  const isTyping = false;
  const regeneratingIndex =
    regeneratingIndices.size > 0 ? Array.from(regeneratingIndices)[0] : null;

  // Model selection logic - direct implementation
  const selectedModel = options?.selectedModel ?? "gpt-3.5-turbo";
  const updateModel = options?.setModel ?? (() => {});

  // Search mode logic
  const { isSearchMode, onSearchToggle } = useChatRoomSearch(
    selectedModel,
    setMessages
  );

  // Input management - using entity hook directly
  const {
    input,
    drafts: _drafts,
    setDrafts,
    handleInputChange,
    clearInput,
  } = useMessageInput(numericRoomId, false);

  // Log only when dependencies change, not on every render
  useEffect(() => {
    logger.debug(
      `Chat actions dependencies updated: room ${
        numericRoomId || "new"
      }, model ${selectedModel}, search mode ${isSearchMode ? "on" : "off"}, ${
        messages.length
      } messages`
    );
  }, [numericRoomId, isSearchMode, selectedModel, messages.length, logger]);

  // Message actions - inline implementation (merged from useMessageActions + sendMessageHandler)
  const sendMessageToBackend = useCallback(
    async (userContent: string) => {
      if (!userContent.trim()) return;

      // Generate message ID for this send operation
      const messageId = generateMessageId();
      const trimmedContent = userContent.trim();

      logger.info("Message send initiated", {
        messageId,
        roomId: numericRoomId,
        model: selectedModel,
        isSearchMode,
        messageLength: trimmedContent.length,
      });

      try {
        // Validate search mode is supported for this model
        if (isSearchMode) {
          const modelInfo = getModelInfo(selectedModel);
          if (!modelInfo?.capabilities.search) {
            const error = `Search is not supported for model: ${selectedModel}`;
            await errorHandler.handle(new Error(error), {
              operation: "validateSearchMode",
              service: "chat",
              component: "useChat",
              metadata: { model: selectedModel, isSearchMode },
            });
            throw new Error(error);
          }
        }

        // Get user session via ServiceRegistry
        logger.debug("Getting user session for message send");
        const authService = ServiceRegistry.createAuthService();
        const session = await authService.getSession();

        if (!session) {
          logger.warn("No active session, aborting message send", {
            messageId,
            roomId: numericRoomId,
          });
          return;
        }

        logger.info("Session validated for message send", {
          messageId,
          userId: session.user.id,
          roomId: numericRoomId,
        });

        // Create the MessageSenderService with all dependencies injected
        logger.debug(
          `Creating message sender service for room ${
            numericRoomId || "new"
          } with model ${selectedModel}`
        );
        const messageSender = ServiceFactory.createMessageSender(
          setMessages,
          () => {} // No-op for setIsTyping - state machine handles typing state
        );

        // Prepare the request
        logger.debug(
          `Preparing message request for room ${
            numericRoomId || "new"
          } with model ${selectedModel} (search: ${isSearchMode ? "on" : "off"})`
        );

        const request: SendMessageRequest = {
          userContent: trimmedContent,
          numericRoomId,
          messages,
          model: selectedModel,
          regenerateIndex: undefined,
          originalAssistantContent: undefined,
          session,
          messageId,
          isSearchMode,
        };

        // Send the message using the SOLID architecture
        logger.info(
          `Sending message to AI service for room ${
            numericRoomId || "new"
          } with model ${selectedModel}`
        );

        const result = await messageSender.sendMessage(request);

        if (!result.success && result.error) {
          logger.error("Message send failed", {
            messageId,
            roomId: numericRoomId,
            error: result.error,
          });
          await errorHandler.handle(new Error(result.error), {
            operation: "sendMessage",
            service: "chat",
            component: "useChat",
            metadata: {
              numericRoomId,
              model: selectedModel,
              isSearchMode,
              messageId,
            },
          });
          throw new Error(result.error);
        }

        logger.info(
          `Message send completed successfully for room ${
            numericRoomId || "new"
          } with model ${selectedModel}`
        );
      } catch (error) {
        logger.error("Failed to send message", {
          messageId,
          error: error as Error,
        });
        throw error;
      }
    },
    [
      numericRoomId,
      messages,
      setMessages,
      setDrafts,
      selectedModel,
      isSearchMode,
      logger,
    ]
  );

  // Use the dedicated regeneration service, wired with the current chat state
  const { regenerateMessage: regenerateMessageInBackend } =
    useRegenerationService(
      numericRoomId,
      {
        messages,
        setMessages,
        startRegenerating,
        stopRegenerating,
      },
      selectedModel,
      isSearchMode
    );

  // Wrapper for sendMessage that handles input clearing and error recovery
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const currentRoomKey = numericRoomId ? numericRoomId.toString() : "new";
    if (__DEV__) {
      logger.debug(`Sending message from room ${currentRoomKey}`);
    }

    clearInput();

    try {
      await sendMessageToBackend(input);
    } catch (error) {
      logger.error(
        `Failed to send message from room ${currentRoomKey}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      handleInputChange(input);
    }
  }, [
    input,
    numericRoomId,
    logger,
    clearInput,
    sendMessageToBackend,
    handleInputChange,
  ]);

  // Wrapper for regenerateMessage with error handling
  const regenerateMessage = useCallback(
    async (index: number, overrideUserContent?: string) => {
      if (index === undefined || index === null) {
        logger.error(`Invalid regeneration index: ${index}`);
        return;
      }
      try {
        await regenerateMessageInBackend(index, overrideUserContent);
      } catch (error) {
        logger.error(
          `Error regenerating message at index ${index}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [regenerateMessageInBackend, logger]
  );

  // Edit a user message in place and regenerate the following assistant message using the edited text
  const editUserAndRegenerate = useCallback(
    async (userIndex: number, newText: string) => {
      if (
        typeof userIndex !== "number" ||
        userIndex < 0 ||
        userIndex >= messages.length
      )
        return;

      // Update UI bubble immediately
      setMessages((prev) => {
        if (userIndex < 0 || userIndex >= prev.length) return prev;
        const target = prev[userIndex];
        if (!target || target.role !== "user") return prev;
        const updated = [...prev];
        updated[userIndex] = { ...target, content: newText };
        return updated;
      });

      // Regenerate the next assistant message with the edited text
      const assistantIndex = userIndex + 1;
      await regenerateMessage(assistantIndex, newText);
    },
    [messages, setMessages, regenerateMessage]
  );

  // Memoize the return object to prevent unnecessary re-renders
  const result = useMemo(
    () => ({
      // State
      messages,
      loading,
      sending,
      isTyping,
      regeneratingIndex,
      regeneratingIndices,
      isNewMessageLoading,
      getLoadingMessages,
      getAnimatingMessages,
      isRegenerating,

      // Input
      input,
      handleInputChange,

      // Actions
      sendMessage,
      regenerateMessage,
      editUserAndRegenerate,

      // Model
      selectedModel,
      updateModel,

      // Search
      isSearchMode,
      onSearchToggle,

      // State setters (for advanced usage)
      setMessages,
    }),
    [
      messages,
      loading,
      sending,
      isTyping,
      regeneratingIndex,
      regeneratingIndices,
      isNewMessageLoading,
      getLoadingMessages,
      getAnimatingMessages,
      isRegenerating,
      input,
      handleInputChange,
      sendMessage,
      regenerateMessage,
      editUserAndRegenerate,
      selectedModel,
      updateModel,
      isSearchMode,
      onSearchToggle,
      setMessages,
    ]
  );

  return result;
};

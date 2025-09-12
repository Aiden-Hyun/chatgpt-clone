// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useEffect, useMemo } from "react";

import { useChatRoomSearch, useMessageOrchestrator } from "@/entities/chatRoom";
import { useMessageInput, useRegenerationService } from "@/entities/message";
import { getLogger } from "@/shared/services/logger";

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

  // Message orchestrator - handles all the complex send logic
  const { sendMessage: sendMessageViaOrchestrator } = useMessageOrchestrator({
    roomId: numericRoomId,
    messages,
    setMessages,
    selectedModel,
    isSearchMode,
  });

  // Input management - using entity hook directly
  const {
    input,
    drafts: _drafts,
    setDrafts: _setDrafts,
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

  // Message actions - simplified implementation using useMessageOrchestrator
  const sendMessageToBackend = useCallback(
    async (userContent: string) => {
      if (!userContent.trim()) return;

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
        const result = await sendMessageViaOrchestrator(trimmedContent);
        
        if (!result.success) {
          const errorMessage = result.error || "Failed to send message";
          logger.error("Message send failed", {
            messageId,
            roomId: numericRoomId,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }

        logger.info(
          `Message send completed successfully for room ${
            result.roomId || numericRoomId || "new"
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
    [sendMessageViaOrchestrator, numericRoomId, selectedModel, isSearchMode, logger]
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

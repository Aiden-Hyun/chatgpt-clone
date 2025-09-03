// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useMemo } from "react";

import { useChatActions } from "./useChatActions";
import { useChatInput } from "./useChatInput";
import { useChatModel } from "./useChatModel";
import { useChatSearch } from "./useChatSearch";
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

  // Model selection logic
  const { selectedModel, updateModel } = useChatModel(
    options?.selectedModel,
    options?.setModel
  );

  // Search mode logic
  const { isSearchMode, onSearchToggle } = useChatSearch(
    selectedModel,
    setMessages
  );

  // Input management
  const { input, drafts, setDrafts, handleInputChange, clearInput } =
    useChatInput(numericRoomId);

  // Message actions
  const { sendMessage: sendMessageAction, regenerateMessage } = useChatActions({
    numericRoomId,
    messages,
    setMessages,
    startRegenerating,
    stopRegenerating,
    drafts,
    setDrafts,
    selectedModel,
    isSearchMode,
  });

  // Wrapper for sendMessage that handles input clearing
  const sendMessage = useCallback(async () => {
    await sendMessageAction(input, clearInput, handleInputChange);
  }, [input, sendMessageAction, clearInput, handleInputChange]);

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

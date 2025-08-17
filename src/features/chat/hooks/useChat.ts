// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
// Model is now passed in from parent; this hook will accept it via options
import { useChatState } from './useChatState';
import { useMessageActions } from './useMessageActions';
import { useMessageInput } from './useMessageInput';
import { useMessageLoader } from './useMessageLoader';
import { useRegenerationService } from './useRegenerationService';

type UseChatOptions = {
  selectedModel?: string;
  setModel?: (model: string) => void | Promise<void>;
  isSearchMode?: boolean;
  onSearchToggle?: () => void;
};

export const useChat = (numericRoomId: number | null, options?: UseChatOptions) => {

  // ✅ STATE MACHINE: Use simplified chat state with state machine support
  const chatState = useChatState(numericRoomId);
  const {
    messages,
    loading,
    regeneratingIndices,
    getLoadingMessages,
    getAnimatingMessages,
    isNewMessageLoading,
    setMessages,
    setLoading,
    startRegenerating,
    stopRegenerating,
    isRegenerating,
  } = chatState;

  // Load messages for this room (no optimistic path)
  useMessageLoader({
    roomId: numericRoomId,
    optimisticMessages: null,
    setMessages,
    setLoading,
  });

  // Model selection provided by parent via options
  const selectedModel = options?.selectedModel ?? 'gpt-3.5-turbo';
  const updateModel = options?.setModel ?? (() => {});
  
  // Search mode state - persist across room changes
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Load search mode from storage on mount
  useEffect(() => {
    const loadSearchMode = async () => {
      try {
        const saved = await mobileStorage.getItem('chat_search_mode');
        if (saved === 'true') {
          setIsSearchMode(true);
        }
      } catch {
        // Ignore storage errors
      }
    };
    loadSearchMode();
  }, []);
  
  const handleSearchToggle = useCallback(() => {
    setIsSearchMode(prev => {
      const newValue = !prev;
      // Persist to mobile storage
      mobileStorage.setItem('chat_search_mode', newValue.toString()).catch(() => {
        // Ignore storage errors
      });
      return newValue;
    });
  }, []);


  // Input management
  const {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  } = useMessageInput(
    numericRoomId,
    false
  );

  // ✅ STATE MACHINE: Message actions using state machine
  const { sendMessage: sendMessageToBackend } = useMessageActions({
    roomId: numericRoomId,
    messages,
    setMessages,
    startRegenerating,
    stopRegenerating,
    drafts,
    setDrafts,
    selectedModel,
    isSearchMode,
  });

  // Use the dedicated regeneration service, wired with the current chat state
  const { regenerateMessage: regenerateMessageInBackend } = useRegenerationService(
    numericRoomId,
    {
      messages,
      setMessages,
      startRegenerating,
      stopRegenerating,
    },
    selectedModel,
  );

  // Wrapper for sendMessage that handles input clearing
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    const currentRoomKey = numericRoomId ? numericRoomId.toString() : 'new';
    if (__DEV__) { console.log(`Sending message from room ${currentRoomKey}`); }

    clearInput();

    try {
      await sendMessageToBackend(userContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      handleInputChange(userContent);
    }
  }, [input, numericRoomId, clearInput, sendMessageToBackend, handleInputChange]);

  // Wrapper for regenerateMessage
  const regenerateMessage = useCallback(async (index: number, overrideUserContent?: string) => {
    
    
    if (index === undefined || index === null) {
      console.error('Invalid regeneration index');
      return;
    }
    try {
      
      await regenerateMessageInBackend(index, overrideUserContent);
      
    } catch (error) {
      console.error('🔄 REGEN-HOOK: Error regenerating message:', error);
    }
  }, [regenerateMessageInBackend]);

  // Edit a user message in place and regenerate the following assistant message using the edited text
  const editUserAndRegenerate = useCallback(async (userIndex: number, newText: string) => {
    if (typeof userIndex !== 'number' || userIndex < 0 || userIndex >= messages.length) return;
    // Update UI bubble immediately
    setMessages(prev => {
      if (userIndex < 0 || userIndex >= prev.length) return prev;
      const target = prev[userIndex];
      if (!target || target.role !== 'user') return prev;
      const updated = [...prev];
      updated[userIndex] = { ...target, content: newText };
      return updated;
    });

    // Regenerate the next assistant message with the edited text
    const assistantIndex = userIndex + 1;
    await regenerateMessage(assistantIndex, newText);
  }, [messages, setMessages, regenerateMessage]);

  return {
    messages,
    loading,
    sending: getLoadingMessages().length > 0,
    isTyping: false,
    regeneratingIndex: regeneratingIndices.size > 0 ? Array.from(regeneratingIndices)[0] : null,
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
    setMessages,
    isSearchMode,
    onSearchToggle: handleSearchToggle,
  };
};

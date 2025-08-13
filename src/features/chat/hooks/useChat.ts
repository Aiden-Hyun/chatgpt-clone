// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { useModel } from '../context/ModelContext';
import { ServiceFactory } from '../services/core';
import { generateMessageId } from '../utils/messageIdGenerator';
import { useChatState } from './useChatState';
import { useMessageActions } from './useMessageActions';
import { useMessageInput } from './useMessageInput';
import { useOptimisticMessages } from './useOptimisticMessages';
import { useRegenerationService } from './useRegenerationService';

export const useChat = (numericRoomId: number | null) => {
  const [isNewlyCreatedRoom, setIsNewlyCreatedRoom] = useState(false);

  // Check if this is a newly created room by looking for optimistic data
  useEffect(() => {
    const checkRoom = async () => {
      if (numericRoomId) {
        try {
          const optimisticData = await mobileStorage.getItem(`chat_messages_${numericRoomId}`);
          const isNewRoom = !!optimisticData;
          setIsNewlyCreatedRoom(isNewRoom);
        } catch {
          setIsNewlyCreatedRoom(false);
        }
      } else {
        setIsNewlyCreatedRoom(false);
      }
    };

    checkRoom();
  }, [numericRoomId]);

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

  // Optimistic messages for new chat room loading
  const { optimisticMessages } = useOptimisticMessages(numericRoomId);

  // Load messages when the room ID changes
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);

      if (numericRoomId) {
        try {
          const messageService = ServiceFactory.createMessageService();
          const history = await messageService.loadMessages(numericRoomId);

          if (history.length > 0) {
            const hydratedHistory = history.map(msg => ({
              ...msg,
              state: 'hydrated' as const,
              id: msg.id || generateMessageId()
            }));
            setMessages(hydratedHistory);
          } else if (optimisticMessages && optimisticMessages.length > 0) {
            const hydratedOptimisticMessages = optimisticMessages.map(msg => ({
              ...msg,
              state: 'hydrated' as const,
              id: msg.id || generateMessageId()
            }));
            setMessages(hydratedOptimisticMessages);
            const pollForDatabaseSync = async () => {
              for (let attempt = 1; attempt <= 10; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                try {
                  const dbMessages = await messageService.loadMessages(numericRoomId);
                  if (dbMessages.length > 0) {
                    const hydratedDbMessages = dbMessages.map(msg => ({
                      ...msg,
                      state: 'hydrated' as const,
                      id: msg.id || generateMessageId()
                    }));
                    setMessages(hydratedDbMessages);
                    break;
                  }
                } catch {}
              }
            };
            pollForDatabaseSync();
          } else {
            setMessages([]);
          }
        } catch (error) {
          console.error(`[MESSAGE-LOAD] Failed to load messages for room ${numericRoomId}:`, error);
          if (optimisticMessages && optimisticMessages.length > 0) {
            const hydratedOptimisticMessages = optimisticMessages.map(msg => ({
              ...msg,
              state: 'hydrated' as const,
              id: msg.id || generateMessageId()
            }));
            setMessages(hydratedOptimisticMessages);
          } else {
            setMessages([]);
          }
        }
        setLoading(false);
      } else {
        setMessages([]);
        setLoading(false);
      }
    };

    loadMessages();
  }, [numericRoomId, optimisticMessages, setMessages, setLoading]);

  // Model selection now provided by parent via context
  const { selectedModel, updateModel } = useModel();

  // Input management
  const {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  } = useMessageInput(numericRoomId, isNewlyCreatedRoom);

  // ✅ STATE MACHINE: Message actions using state machine
  const { sendMessage: sendMessageToBackend } = useMessageActions({
    roomId: numericRoomId,
    messages,
    setMessages,
    startRegenerating,
    stopRegenerating,
    drafts,
    setDrafts,
  });

  // Use the dedicated regeneration service, wired with the current chat state
  const { regenerateMessage: regenerateMessageInBackend } = useRegenerationService(numericRoomId, {
    messages,
    setMessages,
    startRegenerating,
    stopRegenerating,
  });

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
  };
};

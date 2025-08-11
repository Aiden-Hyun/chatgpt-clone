// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { ServiceFactory } from '../services/core';
import { generateMessageId } from '../utils/messageIdGenerator';
import { useChatState } from './useChatState';
import { useMessageActions } from './useMessageActions';
import { useMessageInput } from './useMessageInput';
import { useMessageStorage } from './useMessageStorage';
import { useModelSelection } from './useModelSelection';

export const useChat = (numericRoomId: number | null) => {
  const [isNewlyCreatedRoom, setIsNewlyCreatedRoom] = useState(false);
  
  // Check if this is a newly created room
  useEffect(() => {
    const checkRoom = async () => {
      if (numericRoomId) {
        try {
          const storedData = await mobileStorage.getItem(`chat_messages_${numericRoomId}`);
          const isNewRoom = !!storedData;
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
  
  // Use the new individual hooks with state machine support
  const chatState = useChatState(numericRoomId);
  const {
    messages,
    loading,
    regeneratingIndices,
    processingMessages,
    messageQueue,
    isRegenerating,
    setMessages,
    setLoading,
    startMessageProcessing,
    stopMessageProcessing,
    isMessageProcessing,
    getProcessingMessageIds,
    addMessageToQueue,
    updateMessageStatus,
    removeMessageFromQueue,
    cleanupMessageProcessing,
    setupMessageProcessing,
    handleMessageError,
    startRegenerating,
    stopRegenerating,
  } = chatState;

  // Message storage for navigation
  const { storedMessages } = useMessageStorage(numericRoomId);

  // Load messages when the room ID changes
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);

      if (numericRoomId) {
        // If we have stored messages from navigation, use those
        if (storedMessages && storedMessages.length > 0) {
          const hydratedStoredMessages = storedMessages.map(msg => ({ 
            ...msg, 
            state: 'hydrated' as const,  // Never animate stored messages
            id: msg.id || generateMessageId()
          }));
          setMessages(hydratedStoredMessages);
          setLoading(false);
        } else {
          // Otherwise load from database using service
          const messageService = ServiceFactory.createMessageService();
          const history = await messageService.loadMessages(numericRoomId);
          
          const hydratedHistory = history.map(msg => ({ 
            ...msg, 
            state: 'hydrated' as const,  // Never animate database messages
            id: msg.id || generateMessageId()
          }));
          setMessages(hydratedHistory);
          setLoading(false);
        }
      } else {
        // No room ID, reset messages and show welcome text
        setMessages([]);
        setLoading(false);
      }
    };

    loadMessages();
  }, [numericRoomId, storedMessages, setMessages, setLoading]);

  // Model selection
  const { selectedModel, updateModel } = useModelSelection(numericRoomId);
  
  // Input management
  const {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  } = useMessageInput(numericRoomId, isNewlyCreatedRoom);

  // Message actions (needs drafts from input hook)
  const {
    sendMessage: sendMessageToBackend,
    regenerateMessage: regenerateMessageInBackend,
  } = useMessageActions({
    roomId: numericRoomId,
    messages,
    setMessages,
    startMessageProcessing,
    stopMessageProcessing,
    isMessageProcessing,
    getProcessingMessageIds,
    addMessageToQueue,
    updateMessageStatus,
    removeMessageFromQueue,
    cleanupMessageProcessing,
    setupMessageProcessing,
    handleMessageError,
    startRegenerating,
    stopRegenerating,
    drafts,
    setDrafts,
  });
  
  // Wrapper for sendMessage that handles input clearing
  // Memoized to prevent ChatInput re-renders
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    
    // Store the current room key before sending  
    const currentRoomKey = numericRoomId ? numericRoomId.toString() : 'new';
    if (__DEV__) { console.log(`Sending message from room ${currentRoomKey}`); }
    
    // Clear input immediately for better UX
    clearInput();
    
    try {
      // Send the message (drafts are handled internally by the new system)
      await sendMessageToBackend(userContent);
      
      // Message sent successfully - input is already cleared
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the input content on error so user can retry
      handleInputChange(userContent);
      // You might want to show an error message to the user here
    }
    
    // We don't need to manually clear drafts here as clearInput() already does that
    // and we want to avoid multiple state updates that could cause infinite loops
    
    // If we're in a 'new' room, we'll handle the draft clearing in sendMessageToBackend
    // This avoids race conditions with navigation and state updates
  }, [input, numericRoomId, clearInput, sendMessageToBackend, handleInputChange]);
  
  // Wrapper for regenerateMessage
  // Memoized to prevent unnecessary re-renders
  const regenerateMessage = useCallback(async (index: number) => {
    await regenerateMessageInBackend(index);
  }, [regenerateMessageInBackend]);

  return {
    // Message state (compatible with old API)
    messages,
    loading,
    sending: processingMessages.size > 0, // Convert Set to boolean for backward compatibility
    isTyping: false, // TODO: Implement typing state in new system
    regeneratingIndex: regeneratingIndices.size > 0 ? Array.from(regeneratingIndices)[0] : null, // Convert Set to single index for backward compatibility
    
    // New state machine fields
    regeneratingIndices,
    processingMessages,
    messageQueue,
    isRegenerating,
    
    // Input state
    input,
    handleInputChange,
    
    // Actions
    sendMessage,
    regenerateMessage,
    
    // Model selection
    selectedModel,
    updateModel,
  };
};

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { supabase } from '../../../shared/lib/supabase';
import { ServiceFactory } from '../services/core';
import { useChatState } from './useChatState';
import { useMessageActions } from './useMessageActions';
import { useMessageInput } from './useMessageInput';
import { useMessageStorage } from './useMessageStorage';

export const useChatSimplified = (numericRoomId: number | null) => {
  const [isNewlyCreatedRoom, setIsNewlyCreatedRoom] = useState(false);
  
  // Unified chat state
  const chatState = useChatState(numericRoomId);
  const {
    messages,
    loading,
    // ❌ Remove legacy state
    // isNewMessageLoading,
    regeneratingIndices,
    processingMessages,
    messageQueue,
    isRegenerating,
    setMessages,
    setLoading,
    // NEW: Message-specific loading actions
    startMessageProcessing,
    stopMessageProcessing,
    isMessageProcessing,
    getProcessingMessageIds,
    // NEW: Message queue actions
    addMessageToQueue,
    updateMessageStatus,
    removeMessageFromQueue,
    cleanupMessageProcessing,
    setupMessageProcessing,
    handleMessageError,
    // ✅ Phase 2: Legacy functions removed
    startRegenerating,
    stopRegenerating,
  } = chatState;

  // Message storage for navigation
  const { storedMessages } = useMessageStorage(numericRoomId);

  // Load messages when the room ID changes
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      
      // Check session
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace('/login');
        return;
      }
      
      if (numericRoomId) {
        // If we have stored messages from navigation, use those
        if (storedMessages && storedMessages.length > 0) {
          setMessages(storedMessages);
          setLoading(false);
        } else {
          // Otherwise load from database using service
          const messageService = ServiceFactory.createMessageService();
          const history = await messageService.loadMessages(numericRoomId);
          setMessages(history);
          setLoading(false);
        }
      } else {
        // No room ID, reset messages
        setMessages([]);
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [numericRoomId, storedMessages, setMessages, setLoading]);

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

  // Message input handling
  const {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  } = useMessageInput(numericRoomId, isNewlyCreatedRoom);

  // Message actions
  const { sendMessage: sendMessageToBackend, regenerateMessage: regenerateMessageInBackend } = useMessageActions({
    roomId: numericRoomId,
    messages,
    setMessages,
    // NEW: Use message-specific functions
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
    // ✅ Phase 2: Legacy functions removed
    startRegenerating,
    stopRegenerating,
    drafts,
    setDrafts,
  });

  // Wrapper for sendMessage that handles input clearing
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    
    // Clear input immediately for better UX
    clearInput();
    
    try {
      await sendMessageToBackend(userContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the input content on error so user can retry
      handleInputChange(userContent);
    }
  };

  // Wrapper for regenerateMessage
  const regenerateMessage = async (index: number) => {
    await regenerateMessageInBackend(index);
  };

  return {
    // Message state
    messages,
    loading,
    // ❌ Remove legacy state
    // isNewMessageLoading,
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
  };
}; 
// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { ServiceFactory } from '../services/core';
import { generateMessageId } from '../utils/messageIdGenerator';
import { useChatState } from './useChatState';
import { useMessageActions } from './useMessageActions';
import { useMessageInput } from './useMessageInput';
import { useModelSelection } from './useModelSelection';
import { useOptimisticMessages } from './useOptimisticMessages';

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
          // 🎯 OPTIMISTIC LOADING: Always load full history from database first
          // Optimistic messages are just temporary cache for brand new rooms
          const messageService = ServiceFactory.createMessageService();
          

          
          const history = await messageService.loadMessages(numericRoomId);
          
          if (__DEV__) {
            console.log(`📡 [DB-RESPONSE] Database returned ${history.length} messages for room ${numericRoomId}`, {
              messageIds: history.map(m => m.id),
              firstMessage: history[0]?.content?.substring(0, 50) + '...',
              lastMessage: history[history.length - 1]?.content?.substring(0, 50) + '...'
            });
          }
          
          if (history.length > 0) {
            // Normal case: Use complete database history
            const hydratedHistory = history.map(msg => ({ 
              ...msg, 
              state: 'hydrated' as const,  // Never animate database messages
              id: msg.id || generateMessageId()
            }));
            
            setMessages(hydratedHistory);
            
            if (__DEV__) {
              console.log(`✅ [MESSAGE-LOAD] Set ${hydratedHistory.length} messages for room ${numericRoomId}`);
            }
          } else if (optimisticMessages && optimisticMessages.length > 0) {
            // Brand new room case: Database empty, use optimistic messages temporarily
            const hydratedOptimisticMessages = optimisticMessages.map(msg => ({ 
              ...msg, 
              state: 'hydrated' as const,
              id: msg.id || generateMessageId()
            }));
            setMessages(hydratedOptimisticMessages);
            
            if (__DEV__) {
              console.log(`[OPTIMISTIC-LOAD] Using optimistic messages for new room ${numericRoomId}, polling for database sync`);
            }
            
            // Set up polling to refresh from database once it's ready
            // This handles the race condition between database insert and navigation
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
                    if (__DEV__) {
                      console.log(`[OPTIMISTIC-LOAD] Database sync complete for room ${numericRoomId} (attempt ${attempt})`);
                    }
                    break;
                  }
                } catch (pollError) {
                  if (__DEV__) {
                    console.warn(`[OPTIMISTIC-LOAD] Database poll attempt ${attempt} failed for room ${numericRoomId}:`, pollError);
                  }
                }
              }
            };
            
            // Start polling in background (non-blocking)
            pollForDatabaseSync();
          } else {
            // Empty room case: No messages at all
            setMessages([]);
            if (__DEV__) {
              console.log(`[MESSAGE-LOAD] No messages found for room ${numericRoomId}`);
            }
          }
        } catch (error) {
          console.error(`[MESSAGE-LOAD] Failed to load messages for room ${numericRoomId}:`, error);
          
          // Fallback to optimistic messages if database fails
          if (optimisticMessages && optimisticMessages.length > 0) {
            const hydratedOptimisticMessages = optimisticMessages.map(msg => ({ 
              ...msg, 
              state: 'hydrated' as const,
              id: msg.id || generateMessageId()
            }));
            setMessages(hydratedOptimisticMessages);
            if (__DEV__) {
              console.log(`[OPTIMISTIC-LOAD] Using optimistic messages as fallback for room ${numericRoomId}`);
            }
          } else {
            setMessages([]);
          }
        }
        setLoading(false);
      } else {
        // No room ID, reset messages and show welcome text
        setMessages([]);
        setLoading(false);
      }
    };

    loadMessages();
  }, [numericRoomId, optimisticMessages, setMessages, setLoading]);
  


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

  // ✅ STATE MACHINE: Message actions using state machine
  const {
    sendMessage: sendMessageToBackend,
    regenerateMessage: regenerateMessageInBackend,
  } = useMessageActions({
    roomId: numericRoomId,
    messages,
    setMessages,
    // Regeneration functions
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
    // ✅ STATE MACHINE: Message state (compatible with old API)
    messages,
    loading,
    sending: getLoadingMessages().length > 0, // ✅ STATE MACHINE: Derive from message states
    isTyping: false, // TODO: Implement typing state in new system
    regeneratingIndex: regeneratingIndices.size > 0 ? Array.from(regeneratingIndices)[0] : null, // Convert Set to single index for backward compatibility
    
    // ✅ STATE MACHINE: New state machine fields
    regeneratingIndices,
    isNewMessageLoading,
    getLoadingMessages,
    getAnimatingMessages,
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

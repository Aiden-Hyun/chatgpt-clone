// useChat.ts - Coordinator hook that combines useMessages and useMessageInput
import { useCallback, useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { useMessagesCombined } from './messages';
import { useMessageInput } from './useMessageInput';

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
          console.log(`Room ${numericRoomId} detected as ${isNewRoom ? 'newly created' : 'existing'} room`);
        } catch {
          setIsNewlyCreatedRoom(false);
        }
      } else {
        setIsNewlyCreatedRoom(false);
      }
    };

    checkRoom();
  }, [numericRoomId]);
  
  // Use the extracted hooks
  const {
    messages,
    loading,
    sending,
    isTyping,
    regeneratingIndex,
    selectedModel,
    sendMessage: sendMessageToBackend,
    regenerateMessage: regenerateMessageInBackend,
    updateModel
  } = useMessagesCombined(numericRoomId);
  
  const {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  } = useMessageInput(numericRoomId, isNewlyCreatedRoom);
  
  // Wrapper for sendMessage that handles input clearing
  // Memoized to prevent ChatInput re-renders
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    
    // Store the current room key before sending  
    const currentRoomKey = numericRoomId ? numericRoomId.toString() : 'new';
    console.log(`Sending message from room ${currentRoomKey}`);
    
    // Clear input immediately for better UX
    clearInput();
    
    try {
      // Send the message and handle drafts
      await sendMessageToBackend(userContent, drafts, setDrafts);
      
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
  }, [input, numericRoomId, clearInput, sendMessageToBackend, drafts, setDrafts, handleInputChange]);
  
  // Wrapper for regenerateMessage
  // Memoized to prevent unnecessary re-renders
  const regenerateMessage = useCallback(async (index: number) => {
    await regenerateMessageInBackend(index, drafts, setDrafts);
  }, [regenerateMessageInBackend, drafts, setDrafts]);

  return {
    // Message state
    messages,
    loading,
    sending,
    isTyping,
    regeneratingIndex,
    
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

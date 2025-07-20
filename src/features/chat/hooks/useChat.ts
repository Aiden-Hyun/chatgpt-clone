// useChat.ts - Coordinator hook that combines useMessages and useMessageInput
import { useEffect, useState } from 'react';
import { useMessageInput } from './useMessageInput';
import { useMessages } from './useMessages';

export const useChat = (numericRoomId: number | null) => {
  const [isNewlyCreatedRoom, setIsNewlyCreatedRoom] = useState(false);
  
  // Check if this is a newly created room
  useEffect(() => {
    if (numericRoomId) {
      try {
        const storedData = sessionStorage.getItem(`chat_messages_${numericRoomId}`);
        const isNewRoom = !!storedData;
        setIsNewlyCreatedRoom(isNewRoom);
        
        // Debug log for room detection
        console.log(`Room ${numericRoomId} detected as ${isNewRoom ? 'newly created' : 'existing'} room`);
      } catch (e) {
        // Ignore sessionStorage errors
        setIsNewlyCreatedRoom(false);
      }
    } else {
      setIsNewlyCreatedRoom(false);
    }
  }, [numericRoomId]);
  
  // Use the extracted hooks
  const {
    messages,
    loading,
    sending,
    isTyping,
    selectedModel,
    sendMessage: sendMessageToBackend,
    regenerateMessage: regenerateMessageInBackend,
    updateModel
  } = useMessages(numericRoomId);
  
  const {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  } = useMessageInput(numericRoomId, isNewlyCreatedRoom);
  
  // Wrapper for sendMessage that handles input clearing
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    
    // Store the current room key before sending
    const currentRoomKey = numericRoomId ? numericRoomId.toString() : 'new';
    console.log(`Sending message from room ${currentRoomKey}`);
    
    // Clear input before sending to prevent stale input state
    clearInput();
    
    // Send the message and handle drafts
    await sendMessageToBackend(userContent, drafts, setDrafts);
    
    // We don't need to manually clear drafts here as clearInput() already does that
    // and we want to avoid multiple state updates that could cause infinite loops
    
    // If we're in a 'new' room, we'll handle the draft clearing in sendMessageToBackend
    // This avoids race conditions with navigation and state updates
  };
  
  // Wrapper for regenerateMessage
  const regenerateMessage = async (index: number) => {
    await regenerateMessageInBackend(index, drafts, setDrafts);
  };

  return {
    // Message state
    messages,
    loading,
    sending,
    isTyping,
    
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

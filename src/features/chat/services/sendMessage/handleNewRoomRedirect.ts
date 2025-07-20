// src/features/chat/services/sendMessage/handleNewRoomRedirect.ts
import { router } from 'expo-router';
import { ChatMessage } from '../../types';

/**
 * Handles persisting data and redirecting to a new chat room
 */
export const handleNewRoomRedirect = ({
  roomId,
  userMsg,
  fullContent,
  model,
}: {
  roomId: number;
  userMsg: ChatMessage;
  fullContent: string;
  model: string;
}): void => {
  try {
    // Store messages
    const messagesForStorage = [
      userMsg,
      { role: 'assistant', content: fullContent }
    ];
    sessionStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(messagesForStorage));
    
    // Store the selected model to ensure it persists
    sessionStorage.setItem(`chat_model_${roomId}`, model);
    
    // Store a flag to indicate this is a newly created room that needs special handling
    sessionStorage.setItem(`new_room_created_${roomId}`, 'true');
    
    console.log(`Stored model in sessionStorage: ${model} for room ${roomId}`);
  } catch (e) {
    console.log('Could not store data in sessionStorage');
  }
  
  // Now navigate to the new room
  // Use setTimeout to ensure all state updates are processed before navigation
  setTimeout(() => {
    router.replace(`/chat?roomId=${roomId}`);
  }, 50);
};

// src/features/chat/services/sendMessage/handleNewRoomRedirect.ts
import { router } from 'expo-router';
import mobileStorage from '../../../../shared/lib/mobileStorage';
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
    // Persist messages using mobile-safe storage
    mobileStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(messagesForStorage));

    
    // Store the selected model to ensure it persists
    mobileStorage.setItem(`chat_model_${roomId}`, model);

    
    // Store a flag to indicate this is a newly created room that needs special handling
    mobileStorage.setItem(`new_room_created_${roomId}`, 'true');
    
    // (Retained above individual debug logs)
  } catch (e) {

  }
  
  // Now navigate to the new room
  // Use setTimeout to ensure all state updates are processed before navigation
  setTimeout(() => {
    router.replace(`/chat/${roomId}`);
  }, 50);
};

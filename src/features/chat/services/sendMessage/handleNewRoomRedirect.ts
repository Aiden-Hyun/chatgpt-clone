// src/features/chat/services/sendMessage/handleNewRoomRedirect.ts
import { router } from 'expo-router';
import mobileStorage from '../../../../shared/lib/mobileStorage';
import { ChatMessage } from '../../types';

/**
 * Handles optimistic loading for new chat rooms by storing temporary messages
 * and redirecting to the new room. This ensures smooth UX during database sync.
 * Enhanced with better error handling and robustness
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
    // Store optimistic data for immediate display while database syncs
    const optimisticData = {
      messages: [
        userMsg,
        { role: 'assistant', content: fullContent }
      ],
      timestamp: Date.now(),
      version: '1.0', // For future migrations if needed
    };
    
    // Persist optimistic messages for immediate display during navigation
    mobileStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(optimisticData));
    
    // Store the selected model for optimistic loading
    mobileStorage.setItem(`chat_model_${roomId}`, model);
    
    // Store a flag to indicate this is a newly created room that needs special handling
    mobileStorage.setItem(`new_room_created_${roomId}`, 'true');
    
    if (__DEV__) {
      console.log(`[OPTIMISTIC-LOAD] Stored optimistic data for new room ${roomId}`, {
        messageCount: optimisticData.messages.length,
        model,
        timestamp: optimisticData.timestamp
      });
    }
    
    // Add cleanup timeout as safety net - clean up after 30 seconds regardless
    setTimeout(() => {
      try {
        mobileStorage.removeItem(`chat_messages_${roomId}`);
        mobileStorage.removeItem(`new_room_created_${roomId}`);
        if (__DEV__) {
          console.log(`[OPTIMISTIC-LOAD] Safety cleanup completed for room ${roomId}`);
        }
      } catch (error) {
        console.warn(`[OPTIMISTIC-LOAD] Safety cleanup failed for room ${roomId}:`, error);
      }
    }, 30000); // 30 seconds
    
  } catch (error) {
    console.error(`[OPTIMISTIC-LOAD] Failed to store optimistic data for room ${roomId}:`, error);
    // Continue with navigation even if optimistic storage fails - better than blocking the user
  }
  
  // Navigate with slight delay for database consistency
  // Increased from 50ms to 100ms for better reliability
  setTimeout(() => {
    router.replace(`/chat/${roomId}`);
  }, 100);
};

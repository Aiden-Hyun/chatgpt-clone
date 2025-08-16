// src/features/chat/hooks/useOptimisticMessages.ts
import { useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { STALE_MESSAGE_THRESHOLD_MS } from '../constants';
import { ChatMessage } from '../types';

type StorageLike = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
};

export const useOptimisticMessages = (
  numericRoomId: number | null,
  deps?: { storage?: StorageLike }
) => {
  const storage = deps?.storage ?? mobileStorage;
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[] | null>(null);
  const [optimisticModel, setOptimisticModel] = useState<string | null>(null);

  useEffect(() => {
    const loadOptimisticData = async () => {
      if (!numericRoomId) {
        setOptimisticMessages(null);
        setOptimisticModel(null);
        return;
      }

      try {
        // Check for optimistic messages (for new chat rooms)
        const optimisticData = await storage.getItem(`chat_messages_${numericRoomId}`);
        if (optimisticData) {
          const parsed = JSON.parse(optimisticData);
          
          // Handle both old format (array) and new format (object with metadata)
          let messages: ChatMessage[];
          let timestamp = 0;
          
          if (Array.isArray(parsed)) {
            // Old format: just an array of messages
            messages = parsed;
          } else {
            // New format: object with messages, timestamp, version
            messages = parsed.messages || [];
            timestamp = parsed.timestamp || 0;
          }
          
          // Ignore very old optimistic messages (over 1 minute old)
          // This prevents stale data from being used if something went wrong
          if (timestamp > 0 && Date.now() - timestamp > STALE_MESSAGE_THRESHOLD_MS) {
            if (__DEV__) {
              console.log(`[OPTIMISTIC] Ignoring stale optimistic messages for room ${numericRoomId}`, {
                age: Date.now() - timestamp,
                threshold: STALE_MESSAGE_THRESHOLD_MS
              });
            }
            await storage.removeItem(`chat_messages_${numericRoomId}`);
            setOptimisticMessages(null);
          } else {
            if (__DEV__) {
              console.log(`[OPTIMISTIC] Loaded optimistic messages for new room ${numericRoomId}`, {
                messageCount: messages.length,
                age: timestamp > 0 ? Date.now() - timestamp : 'unknown'
              });
            }
            setOptimisticMessages(messages);
            
            // Clear the optimistic messages immediately after reading
            await storage.removeItem(`chat_messages_${numericRoomId}`);
          }
        } else {
          setOptimisticMessages(null);
        }

        // Check for optimistic model
        const optimisticModelData = await storage.getItem(`chat_model_${numericRoomId}`);
        if (optimisticModelData) {
          if (__DEV__) {
            console.log(`[OPTIMISTIC] Loaded optimistic model for room ${numericRoomId}:`, optimisticModelData);
          }
          setOptimisticModel(optimisticModelData);
          // Clear the optimistic model to avoid using it again on refresh
          await storage.removeItem(`chat_model_${numericRoomId}`);
        } else {
          setOptimisticModel(null);
        }
      } catch (error) {
        console.error(`[OPTIMISTIC] Failed to load optimistic data for room ${numericRoomId}:`, error);
        setOptimisticMessages(null);
        setOptimisticModel(null);
        
        // Clean up potentially corrupted data
        try {
          await storage.removeItem(`chat_messages_${numericRoomId}`);
          await storage.removeItem(`chat_model_${numericRoomId}`);
          if (__DEV__) {
            console.log(`[OPTIMISTIC] Cleaned up corrupted data for room ${numericRoomId}`);
          }
        } catch (cleanupError) {
          console.warn(`[OPTIMISTIC] Failed to cleanup corrupted data for room ${numericRoomId}:`, cleanupError);
        }
      }
    };

    loadOptimisticData();
  }, [numericRoomId, deps?.storage]);

  return {
    optimisticMessages,
    optimisticModel,
  };
}; 
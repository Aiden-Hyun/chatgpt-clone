// src/features/chat/hooks/useMessageStorage.ts
import { useEffect, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { ChatMessage } from '../types';

export const useMessageStorage = (numericRoomId: number | null) => {
  const [storedMessages, setStoredMessages] = useState<ChatMessage[] | null>(null);
  const [storedModel, setStoredModel] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredData = async () => {
      if (!numericRoomId) {
        setStoredMessages(null);
        setStoredModel(null);
        return;
      }

      try {
        // Check for stored messages
        const storedData = await mobileStorage.getItem(`chat_messages_${numericRoomId}`);
        if (storedData) {
          const messages = JSON.parse(storedData);
          if (__DEV__) { console.log('[MESSAGE-STORAGE] found stored messages', { count: messages.length, roomId: numericRoomId }); }
          setStoredMessages(messages);
          
          // Clear the stored messages to avoid showing them again on refresh
          await mobileStorage.removeItem(`chat_messages_${numericRoomId}`);
          if (__DEV__) { console.log('[MESSAGE-STORAGE] cleared stored messages from storage'); }
        }

        // Check for stored model
        const storedModelData = await mobileStorage.getItem(`chat_model_${numericRoomId}`);
        if (storedModelData) {
          setStoredModel(storedModelData);
          // Clear the stored model to avoid using it again on refresh
          await mobileStorage.removeItem(`chat_model_${numericRoomId}`);
        }
      } catch (e) {
        if (__DEV__) { console.log('[storage] No stored data found for room in mobileStorage'); }
        setStoredMessages(null);
        setStoredModel(null);
      }
    };

    loadStoredData();
  }, [numericRoomId]);

  return {
    storedMessages,
    storedModel,
  };
}; 
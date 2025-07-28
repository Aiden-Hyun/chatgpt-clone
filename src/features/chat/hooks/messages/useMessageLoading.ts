// src/features/chat/hooks/messages/useMessageLoading.ts
import { router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../../../../shared/lib/supabase';
import { ServiceFactory } from '../../services/core';
import { useMessageStorage } from '../useMessageStorage';

/**
 * Hook for handling message loading, authentication, and navigation
 */
export const useMessageLoading = (
  numericRoomId: number | null,
  messageState: ReturnType<typeof import('./useMessageState').useMessageState>
) => {
  const { messages, setMessages, loading, setLoading } = messageState;
  const { storedMessages } = useMessageStorage(numericRoomId);

  // Load messages when the room ID changes
  useEffect(() => {
    setLoading(true);
    
    const fetchMessages = async () => {
      // Check session
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace('/(auth)/login');
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

  return {
    loading,
  };
}; 
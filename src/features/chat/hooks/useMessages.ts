// useMessages.ts - Hook for managing chat messages and interactions with the backend
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { loadMessages } from '../services/loadMessages';
import { sendMessageHandler } from '../services/sendMessage/index';
import { ChatMessage } from '../types';

/**
 * Hook for managing chat messages, loading state, and interactions with the backend
 */
export const useMessages = (numericRoomId: number | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');

  // Load messages when the room ID changes
  useEffect(() => {
    setLoading(true);
    
    const fetchMessages = async () => {
      // Check session
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace('/login');
        return;
      }
      
      // Fetch the current model if there's a room ID
      if (numericRoomId) {
        const { data: chatroomData } = await supabase
          .from('chatrooms')
          .select('model')
          .eq('id', numericRoomId)
          .single();
        
        if (chatroomData?.model) {
          setSelectedModel(chatroomData.model);
        }
        
        // Check for messages and model in sessionStorage (for new rooms)
        let storedMessages = null;
        try {
          // Check for stored messages
          const storedData = sessionStorage.getItem(`chat_messages_${numericRoomId}`);
          if (storedData) {
            storedMessages = JSON.parse(storedData);
            // Clear the stored messages to avoid showing them again on refresh
            sessionStorage.removeItem(`chat_messages_${numericRoomId}`);
            
            // Check for stored model and use it if available
            const storedModel = sessionStorage.getItem(`chat_model_${numericRoomId}`);
            if (storedModel) {
              console.log(`Retrieved model from sessionStorage: ${storedModel} for room ${numericRoomId}`);
              setSelectedModel(storedModel);
              // Clear the stored model to avoid using it again on refresh
              sessionStorage.removeItem(`chat_model_${numericRoomId}`);
            }
          }
        } catch (e) {
          console.log('No stored data found in sessionStorage');
        }
        
        // If we have stored messages from navigation, use those
        if (storedMessages && storedMessages.length > 0) {
          setMessages(storedMessages);
          setLoading(false);
        } else {
          // Otherwise load from database
          const history = await loadMessages(numericRoomId);
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
  }, [numericRoomId]);

  /**
   * Send a new message to the chat
   */
  const sendMessage = async (userContent: string, drafts: Record<string, string>, setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
    if (!userContent.trim()) return;
    setSending(true);

    await sendMessageHandler({
      userContent,
      numericRoomId,
      messages,
      setMessages,
      setIsTyping,
      setDrafts,
      model: selectedModel,
    });

    setSending(false);
  };
  
  /**
   * Regenerate an assistant message
   */
  const regenerateMessage = async (index: number, drafts: Record<string, string>, setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
    // Only regenerate assistant messages
    if (index < 1 || index >= messages.length || messages[index].role !== 'assistant') {
      return;
    }
    
    // Find the corresponding user message that came before this assistant message
    const userMessage = messages[index - 1];
    if (userMessage.role !== 'user') {
      console.error('Expected user message before assistant message');
      return;
    }
    
    // Set typing state
    setIsTyping(true);
    setSending(true);
    
    try {
      // Create a copy of messages up to but not including the assistant message to regenerate
      const messagesUpToUser = messages.slice(0, index);
      
      // Call sendMessageHandler with the user message content and a flag to replace the existing assistant message
      await sendMessageHandler({
        userContent: userMessage.content,
        numericRoomId,
        messages: messagesUpToUser,
        setMessages,
        setIsTyping,
        setDrafts,
        model: selectedModel,
        regenerateIndex: index,
      });
    } catch (error) {
      console.error('Error regenerating message:', error);
    } finally {
      setSending(false);
    }
  };

  /**
   * Update the selected model for the chat
   */
  const updateModel = async (model: string) => {
    setSelectedModel(model);
    
    // Update the model in the database if we have a room ID
    if (numericRoomId) {
      await supabase
        .from('chatrooms')
        .update({ model })
        .eq('id', numericRoomId);
    }
  };

  return {
    // State
    messages,
    loading,
    sending,
    isTyping,
    selectedModel,
    
    // State setters (needed for coordination)
    setMessages,
    setIsTyping,
    
    // Actions
    sendMessage,
    regenerateMessage,
    updateModel,
  };
};

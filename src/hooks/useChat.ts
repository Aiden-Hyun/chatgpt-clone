// useChat.ts
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { loadMessages } from '../services/chat/loadMessages';
import { sendMessageHandler } from '../services/chat/sendMessage';
import { supabase } from '../supabase';
import { ChatMessage } from '../types';

export const useChat = (numericRoomId: number | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');

  useEffect(() => {
    setLoading(true);
    
    const fetchMessages = async () => {
      // Check session
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        router.replace('/login');
        return;
      }
      
      // Set input from drafts
      const roomKey = numericRoomId ? numericRoomId.toString() : 'new';
      
      // Check if this is a newly created room by looking for stored messages
      let isNewlyCreatedRoom = false;
      if (numericRoomId) {
        try {
          const storedData = sessionStorage.getItem(`chat_messages_${numericRoomId}`);
          isNewlyCreatedRoom = !!storedData;
        } catch (e) {
          // Ignore sessionStorage errors
        }
      }
      
      // For newly created rooms, always start with empty input
      if (isNewlyCreatedRoom) {
        setInput('');
      } else {
        setInput(drafts[roomKey] || '');
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

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userContent = input.trim();
    setInput('');
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
  
  const regenerateMessage = async (index: number) => {
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

  const handleInputChange = (text: string) => {
    setInput(text);
    const roomKey = numericRoomId ? numericRoomId.toString() : 'new';
    setDrafts((prev) => ({ ...prev, [roomKey]: text }));
  };

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
    messages,
    input,
    loading,
    sending,
    isTyping,
    sendMessage,
    handleInputChange,
    selectedModel,
    updateModel,
    regenerateMessage,
  };
};

// useMessages.ts - Hook for managing chat messages and interactions with the backend
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { ServiceFactory } from '../services/core';
import { sendMessageHandler } from '../services/sendMessage/index';
import { ChatMessage } from '../types';
import { useMessageStorage } from './useMessageStorage';
import { useModelSelection } from './useModelSelection';

/**
 * Hook for managing chat messages, loading state, and interactions with the backend
 */
export const useMessages = (numericRoomId: number | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Use extracted hooks for storage and model selection
  const { storedMessages, storedModel } = useMessageStorage(numericRoomId);
  const { selectedModel, updateModel } = useModelSelection(numericRoomId);

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
  }, [numericRoomId, storedMessages]);

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
   * Regenerate a specific message
   */
  const regenerateMessage = async (index: number, drafts: Record<string, string>, setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
    if (index < 0 || index >= messages.length) return;
    
    const targetMessage = messages[index];
    if (targetMessage.role !== 'assistant') return;
    
    // Find the corresponding user message that came before this assistant message
    const userMessage = messages[index - 1];
    if (userMessage.role !== 'user') {
      console.error('Expected user message before assistant message');
      return;
    }
    
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
      originalAssistantContent: targetMessage.content,
    });
  };

  // Remove the duplicate updateModel function since it's now provided by useModelSelection

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

// src/features/chat/hooks/messages/useMessageState.ts
import { useState } from 'react';
import { ChatMessage } from '../../types';

/**
 * Core state management hook for all message-related state
 * Single source of truth for messages, loading, sending, and typing states
 */
export const useMessageState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  return {
    // State
    messages,
    loading,
    sending,
    isTyping,
    
    // State setters
    setMessages,
    setLoading,
    setSending,
    setIsTyping,
  };
}; 
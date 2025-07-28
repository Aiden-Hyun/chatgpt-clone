// src/features/chat/hooks/messages/useMessagesCombined.ts
import { useModelSelection } from '../useModelSelection';
import { useMessageActions } from './useMessageActions';
import { useMessageLoading } from './useMessageLoading';
import { useMessageRegeneration } from './useMessageRegeneration';
import { useMessageState } from './useMessageState';

/**
 * Backward compatibility wrapper that orchestrates all message-related hooks
 * Maintains the existing useMessages API contract
 */
export const useMessagesCombined = (numericRoomId: number | null) => {
  // Create a single shared state instance
  const messageState = useMessageState();
  
  // Message loading and authentication
  const { loading } = useMessageLoading(numericRoomId, messageState);
  
  // Message actions (sending)
  const { sendMessage, sending } = useMessageActions(numericRoomId, messageState);
  
  // Message regeneration
  const { regenerateMessage } = useMessageRegeneration(numericRoomId, messageState);
  
  // Model selection
  const { selectedModel, updateModel } = useModelSelection(numericRoomId);

  return {
    // State from shared messageState
    messages: messageState.messages,
    loading,
    sending,
    isTyping: messageState.isTyping,
    selectedModel,
    
    // State setters (needed for coordination)
    setMessages: messageState.setMessages,
    setIsTyping: messageState.setIsTyping,
    
    // Actions
    sendMessage,
    regenerateMessage,
    updateModel,
  };
}; 
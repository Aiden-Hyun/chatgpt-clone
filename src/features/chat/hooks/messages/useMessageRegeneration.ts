// src/features/chat/hooks/messages/useMessageRegeneration.ts
import { sendMessageHandler } from '../../services/sendMessage/index';
import { useModelSelection } from '../useModelSelection';

/**
 * Hook for handling message regeneration logic
 */
export const useMessageRegeneration = (
  numericRoomId: number | null,
  messageState: ReturnType<typeof import('./useMessageState').useMessageState>
) => {
  const { messages, setMessages, setIsTyping, setRegeneratingIndex } = messageState;
  const { selectedModel } = useModelSelection(numericRoomId);

  /**
   * Regenerate a specific message
   */
  const regenerateMessage = async (
    index: number, 
    drafts: Record<string, string>, 
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    if (index < 0 || index >= messages.length) return;
    
    const targetMessage = messages[index];
    if (targetMessage.role !== 'assistant') return;
    
    // Set regenerating index to show loading at the specific message position
    setRegeneratingIndex(index);
    // Ensure isTyping is false during regeneration to avoid duplicate loading
    setIsTyping(false);
    
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
    
    // Clear regenerating index when done
    setRegeneratingIndex(null);
  };

  return {
    regenerateMessage,
  };
}; 
// src/features/chat/hooks/messages/useMessageActions.ts
import { sendMessageHandler } from '../../services/sendMessage/index';
import { useModelSelection } from '../useModelSelection';

/**
 * Hook for handling message sending actions
 */
export const useMessageActions = (
  numericRoomId: number | null,
  messageState: ReturnType<typeof import('./useMessageState').useMessageState>
) => {
  const { messages, setMessages, sending, setSending, setIsTyping } = messageState;
  const { selectedModel } = useModelSelection(numericRoomId);

  /**
   * Send a new message to the chat
   */
  const sendMessage = async (
    userContent: string, 
    drafts: Record<string, string>, 
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) => {
    if (!userContent.trim()) return;
    setSending(true);

    try {
      await sendMessageHandler({
        userContent,
        numericRoomId,
        messages,
        setMessages,
        setIsTyping,
        setDrafts,
        model: selectedModel,
      });
    } catch (error) {
      setSending(false);
      throw error; // Re-throw the error so it can be handled by the caller
    }

    setSending(false);
  };

  return {
    sendMessage,
    sending,
  };
}; 
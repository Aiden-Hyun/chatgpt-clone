// src/features/chat/services/sendMessage/handleMessageState.ts
import { ChatMessage } from '../../types';

/**
 * Updates the message state for new messages or regeneration
 */
export const handleMessageState = ({
  regenerateIndex,
  setMessages,
  userMsg,
  assistantMsg,
}: {
  regenerateIndex?: number;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  userMsg: ChatMessage;
  assistantMsg: ChatMessage;
}): void => {
  if (regenerateIndex !== undefined) {
    setMessages((prev) => {
      const updated = [...prev];
      // Update the assistant message at the regeneration index
      updated[regenerateIndex] = { ...updated[regenerateIndex], content: '' };
      return updated;
    });
  } else {
    // Normal flow: add new user and assistant messages
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  }
};

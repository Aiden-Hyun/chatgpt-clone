// src/features/chat/services/legacy/animateResponse.ts
// Original implementation - moved to legacy folder
import { ChatMessage } from '../types';

type AnimateResponseArgs = {
  fullContent: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  regenerateIndex?: number;
  onComplete: () => void;
};

/**
 * Animates the typing of a response with a typewriter effect
 */
export const animateResponse = ({
  fullContent,
  setMessages,
  setIsTyping,
  regenerateIndex,
  onComplete,
}: AnimateResponseArgs): void => {
  let tempContent = '';
  const typeInterval = setInterval(() => {
    if (tempContent.length < fullContent.length) {
      tempContent += fullContent.charAt(tempContent.length);
      setMessages((prev) => {
        const updated = [...prev];
        // If regenerating, update the message at the specified index
        // Otherwise, update the last message
        const targetIndex = regenerateIndex !== undefined ? regenerateIndex : updated.length - 1;
        updated[targetIndex] = { role: 'assistant', content: tempContent };
        return updated;
      });
    } else {
      clearInterval(typeInterval);
      setIsTyping(false);
      onComplete();
    }
  }, 20);
}; 
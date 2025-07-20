// src/features/chat/services/sendMessage/handlePostAnimation.ts
import { Session } from '@supabase/supabase-js';
import { ChatMessage } from '../../types';

/**
 * Handles database operations after animation completes
 */
export const handlePostAnimation = async ({
  regenerateIndex,
  roomId,
  fullContent,
  session,
  userMsg,
  insertMessages,
  updateAssistantMessage,
}: {
  regenerateIndex?: number;
  roomId: number;
  fullContent: string;
  session: Session;
  userMsg: ChatMessage;
  insertMessages: (args: {
    roomId: number;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    session: Session;
  }) => Promise<void>;
  updateAssistantMessage: (args: {
    roomId: number;
    content: string;
    session: Session;
  }) => Promise<void>;
}): Promise<void> => {
  try {
    // If regenerating, update the assistant message in the database
    // Otherwise, insert both user and assistant messages
    if (regenerateIndex !== undefined) {
      console.log(`🔄 Updating regenerated message in database for room ${roomId}`);
      await updateAssistantMessage({
        roomId,
        content: fullContent,
        session,
      });
    } else {
      console.log(`📝 Inserting new messages in database for room ${roomId}`);
      await insertMessages({
        roomId,
        userMessage: userMsg,
        assistantMessage: { role: 'assistant', content: fullContent },
        session,
      });
    }
  } catch (error) {
    console.error('❌ Error in handlePostAnimation:', error);
  }
};

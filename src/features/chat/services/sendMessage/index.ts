// src/features/chat/services/sendMessage/index.ts
import { getSession } from '../../../../shared/lib/supabase/getSession';
import { SendMessageRequest } from '../core/MessageSenderService';
import { ServiceFactory } from '../core/ServiceFactory';
import { ChatMessage } from '../types';

export type SendMessageArgs = {
  userContent: string;
  numericRoomId: number | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  model: string;
  regenerateIndex?: number;
  originalAssistantContent?: string;
};

/**
 * Main controller for sending or regenerating messages
 * Now uses SOLID architecture with clean separation of concerns
 */
export const sendMessageHandler = async (args: SendMessageArgs): Promise<void> => {
  const {
    userContent,
    numericRoomId,
    messages,
    setMessages,
    setIsTyping,
    setDrafts,
    model,
    regenerateIndex,
    originalAssistantContent
  } = args;

  // Get session
  const session = await getSession();
  if (!session) {
    throw new Error('No active session found. Please log in again.');
  }

  // Create the MessageSenderService with all dependencies injected
  const messageSender = ServiceFactory.createMessageSender(setMessages, setIsTyping, setDrafts);

  // Prepare the request
  const request: SendMessageRequest = {
    userContent,
    numericRoomId,
    messages,
    model,
    regenerateIndex,
    originalAssistantContent,
    session,
  };

  // Send the message using the SOLID architecture
  const result = await messageSender.sendMessage(request);

  if (!result.success && result.error) {
    console.error('Message sending failed:', result.error);
    throw new Error(result.error);
  }
};

// src/features/chat/services/sendMessage/index.ts
import { getSession } from '../../../../shared/lib/supabase/getSession';
import { logger } from '../../utils/logger';
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
  // ✅ Phase 2: Add message ID support
  messageId?: string;
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
    originalAssistantContent,
    messageId
  } = args;

  // Use the existing getSession function
  const session = await getSession();
  logger.debug('🔄 SEND-MESSAGE: Session fetched', { hasSession: !!session, userId: session?.user?.id });

  if (!session) {
    logger.warn('🔒 No active session. Aborting sendMessageHandler');
    return;
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
    messageId, // ✅ Phase 2: Pass message ID to service
  };

  // Send the message using the SOLID architecture
  const result = await messageSender.sendMessage(request);

  if (!result.success && result.error) {
    logger.error('Message sending failed', { error: new Error(result.error) });
    throw new Error(result.error);
  }
};

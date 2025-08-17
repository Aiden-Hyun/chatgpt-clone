// src/features/chat/services/sendMessage/index.ts
import { logger } from '../../utils/logger';
import { SendMessageRequest } from '../core/MessageSenderService';
import { ServiceFactory } from '../core/ServiceFactory';
import { ServiceRegistry } from '../core/ServiceRegistry';
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
  // ✅ Phase 3: Add search functionality
  enableSearch?: boolean;
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
    messageId,
    enableSearch
  } = args;
  
  console.log('🔍 [sendMessageHandler] Received request with enableSearch:', enableSearch);

  // Use injected auth service via ServiceRegistry
  const authService = ServiceRegistry.createAuthService();
  const session = await authService.getSession();
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
    enableSearch, // ✅ Phase 3: Pass search flag to service
  };
  
  console.log('🔍 [sendMessageHandler] Prepared request with enableSearch:', request.enableSearch);

  // Send the message using the SOLID architecture
  const result = await messageSender.sendMessage(request);

  if (!result.success && result.error) {
    logger.error('Message sending failed', { error: new Error(result.error) });
    throw new Error(result.error);
  }
};

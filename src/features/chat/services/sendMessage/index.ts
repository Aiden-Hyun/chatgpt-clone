// src/features/chat/services/sendMessage/index.ts
import type { ChatMessage } from "@/entities/message";

import { errorHandler } from "../../../../shared/services/error";
import { getModelInfo } from "../../constants/models";
import { logger } from "../../utils/logger";
import { SendMessageRequest } from "../core/message-sender";
import { ServiceFactory } from "../core/ServiceFactory";
import { ServiceRegistry } from "../core/ServiceRegistry";

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
  // Search mode support
  isSearchMode?: boolean;
};

/**
 * Main controller for sending or regenerating messages
 * Now uses SOLID architecture with clean separation of concerns
 */
export const sendMessageHandler = async (
  args: SendMessageArgs
): Promise<void> => {
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
    isSearchMode = false,
  } = args;

  // Validate search mode is supported for this model
  if (isSearchMode) {
    const modelInfo = getModelInfo(model);
    if (!modelInfo?.capabilities.search) {
      const error = `Search is not supported for model: ${model}`;
      await errorHandler.handle(new Error(error), {
        operation: 'validateSearchMode',
        service: 'chat',
        component: 'sendMessageHandler',
        metadata: { model, isSearchMode }
      });
      throw new Error(error);
    }
  }

  // Use injected auth service via ServiceRegistry
  const authService = ServiceRegistry.createAuthService();
  const session = await authService.getSession();
  logger.debug("🔄 SEND-MESSAGE: Session fetched", {
    hasSession: !!session,
    userId: session?.user?.id,
  });

  if (!session) {
    logger.warn("🔒 No active session. Aborting sendMessageHandler");
    return;
  }

  // Create the MessageSenderService with all dependencies injected
  const messageSender = ServiceFactory.createMessageSender(
    setMessages,
    setIsTyping,
    setDrafts
  );

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
    isSearchMode, // Pass search mode to service
  };

  // Send the message using the SOLID architecture
  const result = await messageSender.sendMessage(request);

  if (!result.success && result.error) {
    await errorHandler.handle(new Error(result.error), {
      operation: 'sendMessage',
      service: 'chat',
      component: 'sendMessageHandler',
      metadata: { 
        numericRoomId, 
        model, 
        regenerateIndex,
        isSearchMode,
        messageId
      }
    });
    throw new Error(result.error);
  }
};

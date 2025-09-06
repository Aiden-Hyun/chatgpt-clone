// src/features/chat/services/sendMessage/index.ts
import type { ChatMessage } from "@/entities/message";
import { getLogger } from "@/shared/services/logger";

import { errorHandler } from "../../../../shared/services/error";
import { getModelInfo } from "../../constants/models";
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
  const logger = getLogger("sendMessageHandler");
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

  logger.info("Message send initiated", {
    messageId,
    roomId: numericRoomId,
    model,
    isSearchMode,
    isRegeneration: regenerateIndex !== undefined,
    messageLength: userContent.length,
  });

  // Validate search mode is supported for this model
  if (isSearchMode) {
    const modelInfo = getModelInfo(model);
    if (!modelInfo?.capabilities.search) {
      const error = `Search is not supported for model: ${model}`;
      await errorHandler.handle(new Error(error), {
        operation: "validateSearchMode",
        service: "chat",
        component: "sendMessageHandler",
        metadata: { model, isSearchMode },
      });
      throw new Error(error);
    }
  }

  // Use injected auth service via ServiceRegistry
  logger.debug("Getting user session");
  const authService = ServiceRegistry.createAuthService();
  const session = await authService.getSession();

  if (!session) {
    logger.warn("No active session, aborting message send", {
      messageId,
      roomId: numericRoomId,
    });
    return;
  }

  logger.info("Session validated for message send", {
    messageId,
    userId: session.user.id,
    roomId: numericRoomId,
  });

  // Create the MessageSenderService with all dependencies injected
  logger.debug("Creating message sender service");
  const messageSender = ServiceFactory.createMessageSender(
    setMessages,
    setIsTyping,
    setDrafts
  );

  // Prepare the request
  logger.debug("Preparing message request", {
    messageId,
    roomId: numericRoomId,
    model,
    isRegeneration: regenerateIndex !== undefined,
    isSearchMode,
  });

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
  logger.info("Sending message to AI service", {
    messageId,
    roomId: numericRoomId,
    model,
  });

  const result = await messageSender.sendMessage(request);

  if (!result.success && result.error) {
    logger.error("Message send failed", {
      messageId,
      roomId: numericRoomId,
      error: result.error,
    });
    await errorHandler.handle(new Error(result.error), {
      operation: "sendMessage",
      service: "chat",
      component: "sendMessageHandler",
      metadata: {
        numericRoomId,
        model,
        regenerateIndex,
        isSearchMode,
        messageId,
      },
    });
    throw new Error(result.error);
  }

  logger.info("Message send completed successfully", {
    messageId,
    roomId: numericRoomId,
    model,
  });
};

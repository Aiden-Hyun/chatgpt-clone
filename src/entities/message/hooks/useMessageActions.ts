import { useCallback } from "react";

import { getLogger } from "@/shared/services/logger";

import { sendMessageHandler } from "../../../features/chat/services/sendMessage";
import { generateMessageId } from "../../../features/chat/utils/messageIdGenerator";
import type { ChatMessage } from "../model/types";

interface UseMessageActionsProps {
  roomId: number | null;
  messages: ChatMessage[];
  setMessages: (
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
  // ✅ STATE MACHINE: Simplified interface using state machine
  startRegenerating: (index: number) => void;
  stopRegenerating: (index: number) => void;
  drafts: Record<string, string>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedModel: string;
  isSearchMode?: boolean;
}

export const useMessageActions = ({
  roomId,
  messages,
  setMessages,
  // ✅ STATE MACHINE: Simplified parameters
  startRegenerating: _startRegenerating,
  stopRegenerating: _stopRegenerating,
  drafts: _drafts,
  setDrafts,
  selectedModel,
  isSearchMode = false,
}: UseMessageActionsProps) => {
  const logger = getLogger("useMessageActions");
  // selectedModel is provided by parent; no hook call here

  const sendMessage = useCallback(
    async (userContent: string) => {
      if (!userContent.trim()) return;

      // ✅ STATE MACHINE: Simplified message sending using the service layer
      const messageId = generateMessageId();

      try {
        await sendMessageHandler({
          userContent: userContent.trim(),
          numericRoomId: roomId,
          messages,
          setMessages, // Direct delegation - service layer handles state machine
          setIsTyping: () => {}, // No-op - state machine handles typing state
          setDrafts,
          model: selectedModel,
          messageId,
          isSearchMode,
        });
      } catch (error) {
        logger.error("Failed to send message", {
          messageId,
          error: error as Error,
        });
        throw error;
      }
    },
    [roomId, messages, setMessages, setDrafts, selectedModel, isSearchMode]
  );

  // Regeneration logic moved to MessageRegenerationService

  return {
    sendMessage,
  };
};

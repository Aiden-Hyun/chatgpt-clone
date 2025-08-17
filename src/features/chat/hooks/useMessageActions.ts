import { useCallback } from 'react';
import { sendMessageHandler } from '../services/sendMessage';
import { ChatMessage } from '../types';
import { logger } from '../utils/logger';
import { generateMessageId } from '../utils/messageIdGenerator';

interface UseMessageActionsProps {
  roomId: number | null;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  // ✅ STATE MACHINE: Simplified interface using state machine
  startRegenerating: (index: number) => void;
  stopRegenerating: (index: number) => void;
  drafts: Record<string, string>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedModel: string;
  // ✅ Phase 3: Add search functionality
  enableSearch?: boolean;
}

export const useMessageActions = ({
  roomId,
  messages,
  setMessages,
  // ✅ STATE MACHINE: Simplified parameters
  startRegenerating,
  stopRegenerating,
  drafts,
  setDrafts,
  selectedModel,
  enableSearch = false,
}: UseMessageActionsProps) => {
  // selectedModel is provided by parent; no hook call here

  const sendMessage = useCallback(async (userContent: string) => {
    if (!userContent.trim()) return;

    // ✅ STATE MACHINE: Simplified message sending using the service layer
    const messageId = generateMessageId();
    logger.info('Starting new message send', { messageId, contentLength: userContent.length, model: selectedModel, enableSearch });

    try {
      console.log('🔍 [useMessageActions] Sending message with search enabled:', enableSearch);
      await sendMessageHandler({
        userContent: userContent.trim(),
        numericRoomId: roomId,
        messages,
        setMessages, // Direct delegation - service layer handles state machine
        setIsTyping: () => {}, // No-op - state machine handles typing state
        setDrafts,
        model: selectedModel,
        messageId,
        enableSearch,
      });
      logger.debug('Message handler completed', { messageId });
    } catch (error) {
      logger.error('Failed to send message', { messageId, error: error as Error });
      throw error;
    }
  }, [roomId, messages, setMessages, setDrafts, selectedModel, enableSearch]);

  // Regeneration logic moved to ReactRegenerationService

  return {
    sendMessage
  };
}; 
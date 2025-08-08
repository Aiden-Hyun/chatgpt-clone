import { useCallback } from 'react';
import { sendMessageHandler } from '../services/sendMessage';
import { ChatMessage } from '../types';
import { logger } from '../utils/logger';
import { generateMessageId } from '../utils/messageIdGenerator';
import { useModelSelection } from './useModelSelection';

interface UseMessageActionsProps {
  roomId: number | null;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  // NEW: Message-specific loading functions
  startMessageProcessing: (messageId: string) => void;
  stopMessageProcessing: (messageId: string) => void;
  isMessageProcessing: (messageId: string) => boolean;
  getProcessingMessageIds: () => string[];
  // NEW: Message queue functions
  addMessageToQueue: (messageId: string, content: string) => void;
  updateMessageStatus: (messageId: string, status: 'pending' | 'processing' | 'completed' | 'failed') => void;
  removeMessageFromQueue: (messageId: string) => void;
  cleanupMessageProcessing: (messageId: string) => void;
  setupMessageProcessing: (messageId: string, content: string) => void;
  handleMessageError: (messageId: string) => void;
  // ✅ Phase 2: Legacy functions removed
  startRegenerating: (index: number) => void;
  stopRegenerating: (index: number) => void;
  drafts: Record<string, string>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const useMessageActions = ({
  roomId,
  messages,
  setMessages,
  // NEW: Message-specific loading functions
  startMessageProcessing,
  stopMessageProcessing,
  isMessageProcessing,
  getProcessingMessageIds,
  // NEW: Message queue functions
  addMessageToQueue,
  updateMessageStatus,
  removeMessageFromQueue,
  cleanupMessageProcessing,
  setupMessageProcessing,
  handleMessageError,
  // ✅ Phase 2: Legacy functions removed
  startRegenerating,
  stopRegenerating,
  drafts,
  setDrafts,
}: UseMessageActionsProps) => {
  const { selectedModel } = useModelSelection(roomId);

  const sendMessage = useCallback(async (userContent: string) => {
    if (!userContent.trim()) return;

    // Generate unique message ID for this request
    const messageId = generateMessageId();
    logger.info('Starting new message send', { messageId, contentLength: userContent.length });

    // Use batch setup function to prevent multiple re-renders
    setupMessageProcessing(messageId, userContent);

    // Create a custom setMessages function that tracks this specific message
    let hasProcessedResponse = false; // Flag to prevent multiple processing - moved outside
    let hasLoggedFirstContent = false; // Flag to prevent excessive logging during animation
    const customSetMessages = (newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      const updatedMessages = typeof newMessages === 'function' ? newMessages(messages) : newMessages;
      
      // Check if the last message (assistant message) now has content
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content.length > 0) {
        // Only log and cleanup once when content first appears
        if (!hasProcessedResponse) {
          hasProcessedResponse = true; // Prevent multiple calls
          logger.info('Assistant response started typing', { messageId });
          
          // Use the batch cleanup function to prevent multiple re-renders
          cleanupMessageProcessing(messageId);
        }
        
        // Only log the first content detection to reduce noise during animation
        if (!hasLoggedFirstContent && lastMessage.content.length === 1) {
          hasLoggedFirstContent = true;
          logger.debug('First character of response detected', { messageId });
        }
      }
      
      setMessages(newMessages);
    };

    try {
      logger.debug('Sending message to handler', { messageId });
      await sendMessageHandler({
        userContent: userContent.trim(),
        numericRoomId: roomId,
        messages,
        setMessages: customSetMessages,
        setIsTyping: (isTyping: boolean) => {
          // Don't stop loading state here - let it persist until content appears
        },
        setDrafts,
        model: selectedModel,
        messageId, // ✅ Phase 2: Pass message ID to handler
      });
      logger.debug('Message handler completed', { messageId });
      logger.info('Message sent successfully', { messageId });
    } catch (error) {
      logger.error('Failed to send message', { messageId, error: error as Error });
      handleMessageError(messageId);
      throw error;
    }
  }, [roomId, messages, setMessages, setupMessageProcessing, cleanupMessageProcessing, handleMessageError, setDrafts, selectedModel]);

  const regenerateMessage = useCallback(async (index: number) => {
    console.log('[REGENERATE] Start', { index });
    if (index < 0 || index >= messages.length) return;

    const targetMessage = messages[index];
    if (targetMessage.role !== 'assistant') return;

    const userMessage = messages[index - 1];
    if (userMessage?.role !== 'user') {
      logger.error('Expected user message before assistant message', { index });
      return;
    }

    // Generate message ID for regeneration
    const messageId = generateMessageId();
    logger.info('Starting message regeneration', { index, messageId, messageContent: userMessage.content });
    startRegenerating(index);

    try {
      console.log('[REGENERATE] Handler → sendMessageHandler');
      await sendMessageHandler({
        userContent: userMessage.content,
        numericRoomId: roomId,
        messages: messages.slice(0, index),
        setMessages,
        setIsTyping: () => {}, // We handle this with regenerating state
        setDrafts,
        model: selectedModel,
        regenerateIndex: index,
        originalAssistantContent: targetMessage.content,
        messageId, // ✅ Phase 2: Pass message ID for regeneration
      });
      logger.info('Message regeneration completed', { index });
      console.log('[REGENERATE] Handler completed', { index });
    } catch (error) {
      logger.error('Failed to regenerate message', { index, error: error as Error });
      stopRegenerating(index);
      throw error;
    } finally {
      stopRegenerating(index);
      console.log('[REGENERATE] Stop', { index });
    }
  }, [roomId, messages, setMessages, startRegenerating, stopRegenerating, setDrafts, selectedModel]);

  return {
    sendMessage,
    regenerateMessage,
  };
}; 
import { useCallback } from 'react';
import { sendMessageHandler } from '../services/sendMessage';
import { useModelSelection } from './useModelSelection';
import { ChatMessage } from '../types';

interface UseMessageActionsProps {
  roomId: number | null;
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  startNewMessageLoading: () => void;
  stopNewMessageLoading: () => void;
  startRegenerating: (index: number) => void;
  stopRegenerating: (index: number) => void;
  drafts: Record<string, string>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const useMessageActions = ({
  roomId,
  messages,
  setMessages,
  startNewMessageLoading,
  stopNewMessageLoading,
  startRegenerating,
  stopRegenerating,
  drafts,
  setDrafts,
}: UseMessageActionsProps) => {
  const { selectedModel } = useModelSelection(roomId);

  const sendMessage = useCallback(async (userContent: string) => {
    if (!userContent.trim()) return;

    startNewMessageLoading();

    try {
      await sendMessageHandler({
        userContent: userContent.trim(),
        numericRoomId: roomId,
        messages,
        setMessages,
        setIsTyping: stopNewMessageLoading, // We'll handle this differently
        setDrafts,
        model: selectedModel,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      stopNewMessageLoading();
      throw error;
    }
  }, [roomId, messages, setMessages, startNewMessageLoading, stopNewMessageLoading, setDrafts, selectedModel]);

  const regenerateMessage = useCallback(async (index: number) => {
    if (index < 0 || index >= messages.length) return;

    const targetMessage = messages[index];
    if (targetMessage.role !== 'assistant') return;

    const userMessage = messages[index - 1];
    if (userMessage?.role !== 'user') {
      console.error('Expected user message before assistant message');
      return;
    }

    startRegenerating(index);

    try {
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
      });
    } catch (error) {
      console.error('Failed to regenerate message:', error);
      stopRegenerating(index);
      throw error;
    } finally {
      stopRegenerating(index);
    }
  }, [roomId, messages, setMessages, startRegenerating, stopRegenerating, setDrafts, selectedModel]);

  return {
    sendMessage,
    regenerateMessage,
  };
}; 
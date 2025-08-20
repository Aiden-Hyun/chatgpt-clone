import { useCallback } from 'react';
import { ChatMessage } from '../../types';
import { useMessageActions } from '../message/useMessageActions';
import { useRegenerationService } from '../message/useRegenerationService';

interface UseChatActionsProps {
  numericRoomId: number | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  startRegenerating: (index: number) => void;
  stopRegenerating: (index: number) => void;
  drafts: Record<string, string>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedModel: string;
  isSearchMode: boolean;
}

export const useChatActions = ({
  numericRoomId,
  messages,
  setMessages,
  startRegenerating,
  stopRegenerating,
  drafts,
  setDrafts,
  selectedModel,
  isSearchMode,
}: UseChatActionsProps) => {
  // ✅ STATE MACHINE: Message actions using state machine
  const { sendMessage: sendMessageToBackend } = useMessageActions({
    roomId: numericRoomId,
    messages,
    setMessages,
    startRegenerating,
    stopRegenerating,
    drafts,
    setDrafts,
    selectedModel,
    isSearchMode,
  });

  // Use the dedicated regeneration service, wired with the current chat state
  const { regenerateMessage: regenerateMessageInBackend } = useRegenerationService(
    numericRoomId,
    {
      messages,
      setMessages,
      startRegenerating,
      stopRegenerating,
    },
    selectedModel,
    isSearchMode
  );

  // Wrapper for sendMessage that handles input clearing
  const sendMessage = useCallback(async (
    userContent: string,
    clearInput: () => void,
    handleInputChange: (text: string) => void
  ) => {
    if (!userContent.trim()) return;
    const currentRoomKey = numericRoomId ? numericRoomId.toString() : 'new';
    if (__DEV__) { console.log(`Sending message from room ${currentRoomKey}`); }

    clearInput();

    try {
      await sendMessageToBackend(userContent);
    } catch (error) {
      console.error('Failed to send message:', error);
      handleInputChange(userContent);
    }
  }, [numericRoomId, sendMessageToBackend]);

  // Wrapper for regenerateMessage
  const regenerateMessage = useCallback(async (index: number, overrideUserContent?: string) => {
    if (index === undefined || index === null) {
      console.error('Invalid regeneration index');
      return;
    }
    try {
      await regenerateMessageInBackend(index, overrideUserContent);
    } catch (error) {
      console.error('🔄 REGEN-HOOK: Error regenerating message:', error);
    }
  }, [regenerateMessageInBackend]);

  return {
    sendMessage,
    regenerateMessage,
  };
};

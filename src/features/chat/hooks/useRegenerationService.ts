// src/features/chat/hooks/useRegenerationService.ts
import { useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/context';
import { useModel } from '../context/ModelContext';
import { ServiceFactory } from '../services/core';
import { MessageStateManager } from '../services/MessageStateManager';
import type { ChatMessage } from '../types';

type Deps = {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  startRegenerating: (index: number) => void;
  stopRegenerating: (index: number) => void;
};

export function useRegenerationService(
  roomId: number | null,
  { messages, setMessages, startRegenerating, stopRegenerating }: Deps
) {
  const { selectedModel } = useModel();
  const { session } = useAuth();
  

  // Create regeneration service
  const regenerationService = useMemo(() => {
    if (!session) return null;

    const messageStateManager = new MessageStateManager(setMessages);
    const aiApiService = ServiceFactory.createAIApiService();
    const messageService = ServiceFactory.createMessageService();
    const animationService = ServiceFactory.createAnimationService(setMessages);

    return ServiceFactory.createRegenerationService(
      messageStateManager,
      aiApiService,
      messageService,
      animationService,
      setMessages,
      session,
      selectedModel,
      roomId
    );
  }, [setMessages, session, selectedModel, roomId]);

  // Expose regeneration functions
  const regenerateMessage = useCallback(
    async (index: number, overrideUserContent?: string) => {
      
      
      if (!regenerationService || !session) {
        console.warn('🔄 REGEN-HOOK: No regenerationService or session');
        return;
      }

      // Validate index is in range at time of click
      if (typeof index !== 'number' || index < 0 || index >= messages.length) {
        console.warn('🔄 REGEN-HOOK: Invalid message index for regeneration:', index);
        return;
      }

      const targetMessage = messages[index];
      if (!targetMessage || targetMessage.role !== 'assistant' || !targetMessage.id) {
        console.warn('🔄 REGEN-HOOK: Target message invalid for regeneration:', targetMessage);
        return;
      }

      // Ensure there's a user message before this
      const userMessage = index > 0 ? messages[index - 1] : null;
      if (!userMessage || userMessage.role !== 'user') {
        console.warn('🔄 REGEN-HOOK: No user message found before assistant message');
        return;
      }

      // Ensure we have user content to condition the regen prompt
      // Assistant content is not required for regen; we only need the target id and prior history
      if (!overrideUserContent && !userMessage.content) {
        console.warn('🔄 REGEN-HOOK: Missing user content for regeneration');
        return;
      }

      // Start tracking regeneration for UI updates
      
      startRegenerating(index);

      try {
        
        
        await regenerationService.regenerateMessage(
          targetMessage.id,
          messages,
          overrideUserContent ?? userMessage.content,
          targetMessage.content
        );
        
        
      } catch (error) {
        console.error('🔄 REGEN-HOOK: Error in regenerationService.regenerateMessage:', error);
      } finally {
        // Always stop tracking regardless of success/failure
        
        stopRegenerating(index);
      }
    },
    [messages, regenerationService, session, startRegenerating, stopRegenerating]
  );

  return {
    regenerateMessage,
  };
}

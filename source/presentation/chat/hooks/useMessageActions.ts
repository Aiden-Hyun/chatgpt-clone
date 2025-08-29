import { useCallback, useMemo } from 'react';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { useToast } from '../../alert/toast';

/**
 * Hook for handling message actions using business layer UseCases
 * Provides proper business logic for copy, edit, resend, regenerate, and like/dislike actions
 */
export function useMessageActions(roomId: string) {
  const { useCaseFactory } = useBusinessContext();
  const { showSuccess, showError } = useToast();

  // Create UseCases once using useMemo
  const copyMessageUseCase = useMemo(() => 
    useCaseFactory.createCopyMessageUseCase(), [useCaseFactory]
  );
  const editMessageUseCase = useMemo(() => 
    useCaseFactory.createEditMessageUseCase(), [useCaseFactory]
  );
  const resendMessageUseCase = useMemo(() => 
    useCaseFactory.createResendMessageUseCase(), [useCaseFactory]
  );
  const regenerateAssistantUseCase = useMemo(() => 
    useCaseFactory.createRegenerateAssistantUseCase(), [useCaseFactory]
  );

  // Copy message to clipboard
  const copyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const result = await copyMessageUseCase.execute({
        messageId,
        content,
        roomId
      });

      if (result.success) {
        showSuccess('Message copied to clipboard');
      } else {
        showError(result.error || 'Failed to copy message');
      }
    } catch (error) {
      showError('Failed to copy message');
    }
  }, [copyMessageUseCase, roomId, showSuccess, showError]);

  // Edit user message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const result = await editMessageUseCase.execute({
        messageId,
        newContent,
        roomId
      });

      if (result.success) {
        showSuccess('Message updated');
        return result.message;
      } else {
        showError(result.error || 'Failed to edit message');
        return null;
      }
    } catch (error) {
      showError('Failed to edit message');
      return null;
    }
  }, [editMessageUseCase, roomId, showSuccess, showError]);

  // Resend message
  const resendMessage = useCallback(async (messageId: string) => {
    try {
      const result = await resendMessageUseCase.execute({
        messageId,
        roomId
      });

      if (result.success) {
        showSuccess('Message resent');
        return result.message;
      } else {
        showError(result.error || 'Failed to resend message');
        return null;
      }
    } catch (error) {
      showError('Failed to resend message');
      return null;
    }
  }, [resendMessageUseCase, roomId, showSuccess, showError]);

  // Regenerate assistant response
  const regenerateAssistant = useCallback(async (messageId: string) => {
    try {
      const result = await regenerateAssistantUseCase.execute({
        messageId,
        roomId
      });

      if (result.success) {
        showSuccess('Response regenerated');
        return result.message;
      } else {
        showError(result.error || 'Failed to regenerate response');
        return null;
      }
    } catch (error) {
      showError('Failed to regenerate response');
      return null;
    }
  }, [regenerateAssistantUseCase, roomId, showSuccess, showError]);

  // Like message (placeholder for future implementation)
  const likeMessage = useCallback(async (messageId: string) => {
    try {
      // TODO: Implement like message UseCase when available
      showSuccess('Message liked');
    } catch (error) {
      showError('Failed to like message');
    }
  }, [showSuccess, showError]);

  // Dislike message (placeholder for future implementation)
  const dislikeMessage = useCallback(async (messageId: string) => {
    try {
      // TODO: Implement dislike message UseCase when available
      showSuccess('Message disliked');
    } catch (error) {
      showError('Failed to dislike message');
    }
  }, [showSuccess, showError]);

  return {
    copyMessage,
    editMessage,
    resendMessage,
    regenerateAssistant,
    likeMessage,
    dislikeMessage
  };
}

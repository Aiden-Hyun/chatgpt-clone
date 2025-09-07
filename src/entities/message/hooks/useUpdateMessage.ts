// src/entities/message/hooks/useUpdateMessage.ts
import { useCallback, useState } from "react";

import { SupabaseMessageService } from "../CRUD/SupabaseMessageCRUD";

export interface UpdateMessageData {
  content?: string;
  fullContent?: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  state?: string;
}

export const useUpdateMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMessage = useCallback(
    async (messageId: number, updates: UpdateMessageData) => {
      setLoading(true);
      setError(null);

      try {
        const messageService = new SupabaseMessageService();
        await messageService.updateMessage(messageId, updates);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update message")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAssistantMessage = useCallback(
    async (messageId: number, content: string) => {
      setLoading(true);
      setError(null);

      try {
        const messageService = new SupabaseMessageService();
        await messageService.updateAssistantMessage(messageId, content);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update assistant message")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAssistantMessageByClientId = useCallback(
    async (clientId: string, content: string) => {
      setLoading(true);
      setError(null);

      try {
        const messageService = new SupabaseMessageService();
        await messageService.updateAssistantMessageByClientId(
          clientId,
          content
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update assistant message by client ID")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAssistantMessageByDbId = useCallback(
    async (dbId: number, content: string) => {
      setLoading(true);
      setError(null);

      try {
        const messageService = new SupabaseMessageService();
        await messageService.updateAssistantMessageByDbId(dbId, content);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update assistant message by DB ID")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateMessage,
    updateAssistantMessage,
    updateAssistantMessageByClientId,
    updateAssistantMessageByDbId,
    loading,
    error,
  };
};

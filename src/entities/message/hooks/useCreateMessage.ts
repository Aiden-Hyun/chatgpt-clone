// src/entities/message/hooks/useCreateMessage.ts
import { useCallback, useState } from "react";

import { SupabaseMessageService } from "../CRUD/SupabaseMessageCRUD";

export interface CreateMessageData {
  roomId: number;
  userMessage: string;
  assistantMessage?: string;
}

export const useCreateMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMessage = useCallback(async (data: CreateMessageData) => {
    setLoading(true);
    setError(null);

    try {
      const messageService = new SupabaseMessageService();
      const messages = await messageService.insertMessages(
        data.roomId,
        data.userMessage,
        data.assistantMessage
      );
      return messages;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to create message")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUserMessage = useCallback(
    async (roomId: number, content: string) => {
      setLoading(true);
      setError(null);

      try {
        const messageService = new SupabaseMessageService();
        const message = await messageService.insertUserMessage(roomId, content);
        return message;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to create user message")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createMessage,
    createUserMessage,
    loading,
    error,
  };
};

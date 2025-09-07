// src/entities/message/hooks/useReadMessages.ts
import { useCallback, useEffect, useState } from "react";

import { SupabaseMessageService } from "../CRUD/SupabaseMessageCRUD";
import { ChatMessage } from "../model/types";

export const useReadMessages = (roomId: number | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const messageService = new SupabaseMessageService();
      const messagesData = await messageService.loadMessages(roomId);
      setMessages(messagesData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch messages")
      );
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const refetch = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    refetch,
  };
};

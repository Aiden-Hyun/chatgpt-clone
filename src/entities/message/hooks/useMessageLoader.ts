import { useEffect } from "react";

import {
  DB_MESSAGE_POLL_ATTEMPTS,
  MESSAGE_FETCH_DELAY_MS,
} from "../../../features/chat/constants";
import { ServiceFactory } from "../../../features/chat/services/core";
import { generateMessageId } from "../../../features/chat/utils/messageIdGenerator";
import type { ChatMessage, MessageWithoutId } from "../model/types";

type UseMessageLoaderDeps = {
  roomId: number | null;
  optimisticMessages: ChatMessage[] | null;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setLoading: (loading: boolean) => void;
  generateId?: () => string;
};

export function useMessageLoader({
  roomId,
  optimisticMessages,
  setMessages,
  setLoading,
  generateId = generateMessageId,
}: UseMessageLoaderDeps) {
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);

      if (!roomId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        const messageService = ServiceFactory.createMessageService();
        const history = await messageService.loadMessages(roomId);

        if (history.length > 0) {
          const hydratedHistory = history.map((msg: MessageWithoutId) => ({
            ...msg,
            state: "hydrated" as const,
            id: msg.id || generateId(),
          }));
          setMessages(hydratedHistory);
        } else if (optimisticMessages && optimisticMessages.length > 0) {
          const hydratedOptimisticMessages = optimisticMessages.map(
            (msg: MessageWithoutId) => ({
              ...msg,
              state: "hydrated" as const,
              id: msg.id || generateId(),
            })
          );
          setMessages(hydratedOptimisticMessages);

          const pollForDatabaseSync = async () => {
            for (
              let attempt = 1;
              attempt <= DB_MESSAGE_POLL_ATTEMPTS;
              attempt++
            ) {
              await new Promise((resolve) =>
                setTimeout(resolve, MESSAGE_FETCH_DELAY_MS)
              );
              try {
                const dbMessages = await messageService.loadMessages(roomId);
                if (dbMessages.length > 0) {
                  const hydratedDbMessages = dbMessages.map(
                    (msg: MessageWithoutId) => ({
                      ...msg,
                      state: "hydrated" as const,
                      id: msg.id || generateId(),
                    })
                  );
                  setMessages(hydratedDbMessages);
                  break;
                }
              } catch {}
            }
          };
          pollForDatabaseSync();
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error(
          `[MESSAGE-LOAD] Failed to load messages for room ${roomId}:`,
          error
        );
        if (optimisticMessages && optimisticMessages.length > 0) {
          const hydratedOptimisticMessages = optimisticMessages.map(
            (msg: MessageWithoutId) => ({
              ...msg,
              state: "hydrated" as const,
              id: msg.id || generateId(),
            })
          );
          setMessages(hydratedOptimisticMessages);
        } else {
          setMessages([]);
        }
      }

      setLoading(false);
    };

    loadMessages();
  }, [roomId, optimisticMessages, setMessages, setLoading, generateId]);
}

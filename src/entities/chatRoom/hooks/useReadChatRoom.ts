// src/entities/chatRoom/hooks/useReadChatRoom.ts
import { useCallback, useEffect, useState } from "react";

import { SupabaseChatRoomService } from "../CRUD/SupabaseChatRoomCRUD";

export interface ChatRoomDetails {
  id: number;
  name: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export const useReadChatRoom = (roomId: number | null) => {
  const [chatRoom, setChatRoom] = useState<ChatRoomDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchChatRoom = useCallback(async () => {
    if (!roomId) return;

    setLoading(true);
    setError(null);

    try {
      const chatRoomService = new SupabaseChatRoomService();
      const roomData = await chatRoomService.getRoom(roomId);
      setChatRoom(roomData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch chat room")
      );
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchChatRoom();
  }, [fetchChatRoom]);

  const refetch = useCallback(() => {
    fetchChatRoom();
  }, [fetchChatRoom]);

  return {
    chatRoom,
    loading,
    error,
    refetch,
  };
};

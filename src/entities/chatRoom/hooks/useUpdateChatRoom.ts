// src/entities/chatRoom/hooks/useUpdateChatRoom.ts
import { useCallback, useState } from "react";

import { SupabaseChatRoomService } from "../CRUD/SupabaseChatRoomCRUD";

export interface UpdateChatRoomData {
  name?: string;
  model?: string;
  updatedAt?: string;
}

export const useUpdateChatRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateChatRoom = useCallback(
    async (roomId: number, updates: UpdateChatRoomData) => {
      setLoading(true);
      setError(null);

      try {
        const chatRoomService = new SupabaseChatRoomService();
        await chatRoomService.updateRoom(roomId, updates);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update chat room")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateChatRoom,
    loading,
    error,
  };
};

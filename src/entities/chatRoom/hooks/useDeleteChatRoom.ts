// src/entities/chatRoom/hooks/useDeleteChatRoom.ts
import { useCallback, useState } from "react";

import { SupabaseChatRoomService } from "../CRUD/SupabaseChatRoomCRUD";

export const useDeleteChatRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteChatRoom = useCallback(async (roomId: number) => {
    setLoading(true);
    setError(null);

    try {
      // Delete the room; messages will be removed via ON DELETE CASCADE
      const chatRoomService = new SupabaseChatRoomService();
      await chatRoomService.deleteRoom(roomId);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to delete chat room")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteChatRoom,
    loading,
    error,
  };
};

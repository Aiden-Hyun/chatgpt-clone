// src/entities/chatRoom/hooks/useDeleteChatRoom.ts
import { useCallback, useState } from "react";

import { SupabaseMessageService } from "../../message/CRUD/SupabaseMessageCRUD";
import { SupabaseChatRoomService } from "../CRUD/SupabaseChatRoomCRUD";

export const useDeleteChatRoom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteChatRoom = useCallback(async (roomId: number) => {
    setLoading(true);
    setError(null);

    try {
      // First delete all messages in the room
      const messageService = new SupabaseMessageService();
      await messageService.deleteMessages(roomId);

      // Then delete the room itself
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

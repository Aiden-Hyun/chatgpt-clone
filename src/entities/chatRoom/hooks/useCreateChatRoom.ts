// src/entities/chatRoom/hooks/useCreateChatRoom.ts
import { useCallback, useState } from "react";

import { useAuth } from "../../session/hooks/useSession";
import { SupabaseChatRoomService } from "../CRUD/SupabaseChatRoomCRUD";

export interface CreateChatRoomData {
  name?: string;
  model?: string;
}

export const useCreateChatRoom = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createChatRoom = useCallback(
    async (data: CreateChatRoomData = {}) => {
      if (!session?.user?.id) {
        setError(new Error("No authenticated user"));
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const chatRoomService = new SupabaseChatRoomService();
        const roomId = await chatRoomService.createRoom(
          session.user.id,
          data.model || "gpt-4o"
        );
        return roomId;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to create chat room")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  return {
    createChatRoom,
    loading,
    error,
  };
};

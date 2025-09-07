// src/entities/chatRoom/hooks/useReadChatRooms.ts
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../session/hooks/useSession";
import { SupabaseChatRoomService } from "../CRUD/SupabaseChatRoomCRUD";

export interface ChatRoom {
  id: number;
  name: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export const useReadChatRooms = () => {
  const { session } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchChatRooms = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const chatRoomService = new SupabaseChatRoomService();
      // Note: This assumes there's a method to get all rooms for a user
      // You might need to add this method to SupabaseChatRoomCRUD
      const rooms = await chatRoomService.getRoomsForUser(session.user.id);
      setChatRooms(rooms);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch chat rooms")
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  const refetch = useCallback(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return {
    chatRooms,
    loading,
    error,
    refetch,
  };
};

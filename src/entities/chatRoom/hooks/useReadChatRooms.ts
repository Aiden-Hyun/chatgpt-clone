// src/entities/chatRoom/hooks/useReadChatRooms.ts
import { useCallback, useEffect, useState } from "react";

import { getLogger } from "../../../shared/services/logger";
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
  const logger = getLogger("useReadChatRooms");
  const { session } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchChatRooms = useCallback(async () => {
    logger.debug("fetchChatRooms called", {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      logger.warn("No session or user ID, skipping fetch");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.debug("Creating chat room service and fetching rooms");
      const chatRoomService = new SupabaseChatRoomService();
      const allRooms = await chatRoomService.getRoomsForUser(session.user.id);

      // Filter out empty rooms (rooms without messages)
      const roomsWithMessages = [];
      for (const room of allRooms) {
        const isEmpty = await chatRoomService.isRoomEmpty(room.id);
        if (!isEmpty) {
          roomsWithMessages.push(room);
        }
      }

      logger.debug("Rooms fetched and filtered", {
        totalRooms: allRooms.length,
        roomsWithMessages: roomsWithMessages.length,
        rooms: roomsWithMessages.map((r) => ({ id: r.id, name: r.name })),
      });

      setChatRooms(roomsWithMessages);
    } catch (err) {
      logger.error("Failed to fetch chat rooms", { error: err });
      setError(
        err instanceof Error ? err : new Error("Failed to fetch chat rooms")
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, logger]);

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

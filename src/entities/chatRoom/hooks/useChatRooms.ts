import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/entities/session";

import { chatDebugLog } from "../../../features/chat/constants";
import mobileStorage from "../../../shared/lib/mobileStorage"; // Add this import
import { supabase } from "../../../shared/lib/supabase";

import type { ChatRoomWithLastMsg } from "../model/types";

export const useChatRooms = () => {
  const { session } = useAuth();
  const [rooms, setRooms] = useState<ChatRoomWithLastMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    if (!session) {
      // router.replace('/login');
      return;
    }

    // First, get all chat rooms for the user

    const { data: allRoomRows, error: roomsError } = await supabase
      .from("chatrooms")
      .select("id, updated_at")
      .eq("user_id", session.user.id);

    if (roomsError || !allRoomRows) {
      console.warn("[ROOMS] fetchRooms:rooms error", roomsError);
      setLoading(false);
      return;
    }

    const allRoomIds = allRoomRows.map((r) => r.id);

    if (allRoomIds.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    // Get rooms that have messages

    const { data: roomsWithMessages } = await supabase
      .from("messages")
      .select("room_id")
      .in("room_id", allRoomIds);

    if (!roomsWithMessages || roomsWithMessages.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    // Get unique room IDs that have messages
    const roomIdsWithMessages = [
      ...new Set(roomsWithMessages.map((m) => m.room_id)),
    ];

    // Fetch latest user messages for rooms that have messages

    const { data: messageRows } = await supabase
      .from("messages")
      .select("room_id, content, created_at")
      .in("room_id", roomIdsWithMessages)
      .eq("role", "user")
      .order("created_at", { ascending: false });

    // Build map of first (latest) message per room
    const latestByRoom = new Map<
      number,
      { content?: string; created_at?: string }
    >();
    messageRows?.forEach((msg) => {
      if (!latestByRoom.has(msg.room_id)) {
        latestByRoom.set(msg.room_id, {
          content: msg.content as string,
          created_at: msg.created_at as string,
        });
      }
    });

    const mapped: ChatRoomWithLastMsg[] = roomIdsWithMessages
      .map((roomId) => ({
        id: roomId,
        name: latestByRoom.get(roomId)?.content || "New Chat",
        last_message: latestByRoom.get(roomId)?.content,
        last_activity: latestByRoom.get(roomId)?.created_at,
        updated_at: (allRoomRows.find((r) => r.id === roomId) as any)
          ?.updated_at as string | undefined,
      }))
      .sort((a, b) => {
        const at = a.last_activity ? new Date(a.last_activity).getTime() : 0;
        const bt = b.last_activity ? new Date(b.last_activity).getTime() : 0;
        return bt - at;
      });

    setRooms(mapped);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchRooms();
    // Local event fallback removed to avoid adding empty rooms; rely on Realtime message inserts
    const off = () => {};
    // Realtime: listen for message inserts to reflect new rooms instantly
    let channel: any;
    (async () => {
      if (!session) return;
      channel = supabase
        .channel("rooms-message-inserts")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `user_id=eq.${session.user.id}`,
          },
          async (payload) => {
            try {
              const roomId = (payload.new as any).room_id as number;
              chatDebugLog("[ROOMS-RT] insert for room", { roomId });
              // Fetch room metadata
              const { data: roomRow } = await supabase
                .from("chatrooms")
                .select("id, name, updated_at")
                .eq("id", roomId)
                .maybeSingle();
              // Move room to the top (or insert if missing)
              setRooms((prev) => {
                const existing = prev.find((r) => r.id === roomId);
                const filtered = prev.filter((r) => r.id !== roomId);
                return [
                  {
                    id: roomId,
                    name: existing?.name || roomRow?.name || "New Chat",
                    last_message:
                      ((payload.new as any).content as string | undefined) ??
                      existing?.last_message,
                    last_activity:
                      ((payload.new as any).created_at as string | undefined) ??
                      existing?.last_activity,
                    updated_at: roomRow?.updated_at ?? existing?.updated_at,
                  },
                  ...filtered,
                ];
              });
            } catch {
              // Fallback: trigger full fetch
              fetchRooms();
            }
          }
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
      off?.();
    };
  }, [fetchRooms, session]);

  const deleteRoom = useCallback(
    async (roomId: number) => {
      if (!session) return;

      try {
        const { error: msgErr } = await supabase
          .from("messages")
          .delete()
          .eq("room_id", roomId);
        if (msgErr) console.warn("[ROOMS] deleteRoom:messages error", msgErr);
        const { error: roomErr } = await supabase
          .from("chatrooms")
          .delete()
          .eq("id", roomId)
          .eq("user_id", session.user.id);
        if (roomErr) {
          console.warn("[ROOMS] deleteRoom:chatrooms error", roomErr);
          return;
        }
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
      } catch {
        console.warn("[ROOMS] deleteRoom:exception");
        return;
      }
    },
    [session]
  ); // Dependency on session

  // Use stable identity to avoid re-renders in consumers that depend on this function
  const startNewChat = useCallback(async () => {
    // Clear search mode from storage to ensure new chat starts fresh
    try {
      await mobileStorage.removeItem("chat_search_mode");
      console.log("[ROOMS] Cleared search mode for new chat");
    } catch (error) {
      console.warn("[ROOMS] Failed to clear search mode:", error);
    }

    router.push("/chat");
  }, []);

  return {
    rooms,
    loading,
    fetchRooms,
    deleteRoom,
    startNewChat,
  };
};

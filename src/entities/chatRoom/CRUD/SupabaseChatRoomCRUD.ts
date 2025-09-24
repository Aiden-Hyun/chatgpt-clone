// src/features/chat/services/implementations/SupabaseChatRoomService.ts
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";

import type { IChatRoomService } from "../model/types";

const logger = getLogger("SupabaseChatRoomService");

export class SupabaseChatRoomService implements IChatRoomService {
  async createRoom(userId: string, model: string): Promise<number | null> {
    logger.debug("createRoom called", { userId, model });

    // 1. Check for existing empty room
    const existingEmptyRoom = await this.getEmptyRoomForUser(userId);

    if (existingEmptyRoom) {
      logger.debug("Empty room exists, returning existing room", {
        roomId: existingEmptyRoom,
        userId,
      });
      return existingEmptyRoom;
    }

    // 2. Create new room with a default name (database will update it)
    logger.debug("No empty room found, creating new room");
    const defaultName = "New Chat";

    const { data, error } = await supabase
      .from("chatrooms")
      .insert({ name: defaultName, user_id: userId, model })
      .select("id")
      .single();

    if (error || !data) {
      logger.error("Failed to create chatroom", { error });
      return null;
    }

    logger.debug("New room created successfully", { roomId: data.id, userId });
    return data.id;
  }

  async updateRoom(
    roomId: number,
    updates: {
      name?: string;
      model?: string;
      updatedAt?: string;
    }
  ): Promise<void> {
    const updateData: Record<string, string> = {};

    if (updates.model !== undefined) updateData.model = updates.model;
    if (updates.updatedAt !== undefined)
      updateData.updated_at = updates.updatedAt;

    // Only perform update if there are actual changes
    if (Object.keys(updateData).length === 0) {
      return;
    }

    const { error } = await supabase
      .from("chatrooms")
      .update(updateData)
      .eq("id", roomId);

    if (error) {
      logger.error("Failed to update room", { error });
      // Don't throw error for room updates - they're not critical
      // Just log the error and continue
      logger.warn("Room update failed, but continuing with message flow");
    }
  }

  async getRoom(roomId: number): Promise<{
    id: number;
    name: string;
    model: string;
    createdAt: string;
    updatedAt: string;
  } | null> {
    const { data, error } = await supabase
      .from("chatrooms")
      .select("id, name, model, created_at, updated_at")
      .eq("id", roomId)
      .single();

    if (error || !data) {
      logger.error("Failed to get room", { error });
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      model: data.model,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getRoomsForUser(userId: string): Promise<
    {
      id: number;
      name: string;
      model: string;
      createdAt: string;
      updatedAt: string;
    }[]
  > {
    logger.debug("getRoomsForUser called", { userId });

    const { data, error } = await supabase
      .from("chatrooms")
      .select("id, name, model, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      logger.error("Failed to get rooms for user", { error, userId });
      return [];
    }

    const rooms = (data || []).map((room) => ({
      id: room.id,
      name: room.name,
      model: room.model,
      createdAt: room.created_at,
      updatedAt: room.updated_at,
    }));

    logger.debug("getRoomsForUser response", {
      userId,
      rawCount: (data || []).length,
      mappedCount: rooms.length,
      sample: rooms.slice(0, 3).map((r) => ({ id: r.id, name: r.name })),
    });

    logger.debug("getRoomsForUser success", {
      userId,
      roomCount: rooms.length,
    });
    return rooms;
  }

  async getEmptyRoomForUser(userId: string): Promise<number | null> {
    logger.debug("getEmptyRoomForUser called", { userId });

    const { data, error } = await supabase.rpc("get_empty_room_for_user", {
      user_uuid: userId,
    });

    if (error) {
      logger.error("Failed to get empty room for user", { error, userId });
      return null;
    }

    logger.debug("getEmptyRoomForUser result", { userId, emptyRoomId: data });
    return data;
  }

  async isRoomEmpty(roomId: number): Promise<boolean> {
    logger.debug("isRoomEmpty called", { roomId });

    const { data, error } = await supabase.rpc("is_empty_room", {
      room_id: roomId,
    });

    if (error) {
      logger.error("Failed to check if room is empty", { error, roomId });
      return false;
    }

    logger.debug("isRoomEmpty result", { roomId, isEmpty: data });
    return data;
  }

  async deleteRoom(roomId: number): Promise<void> {
    if (__DEV__) {
      logger.debug("service.deleteRoom:start", { roomId });
    }
    const { error } = await supabase
      .from("chatrooms")
      .delete()
      .eq("id", roomId);

    if (error) {
      logger.error("Failed to delete room", { error });
      throw error;
    }
    if (__DEV__) {
      logger.debug("service.deleteRoom:done", { roomId });
    }
  }
}

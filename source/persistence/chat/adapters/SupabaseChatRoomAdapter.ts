import { supabase } from '../../../../src/shared/lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface RoomData {
  id: number;
  name: string;
  model: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface RoomUpdateData {
  name?: string;
  model?: string;
  updated_at?: string;
}

export interface RoomWithLastMessage extends RoomData {
  last_message?: string;
  last_activity?: string;
}

export class SupabaseChatRoomAdapter {
  async createRoom(session: Session, model: string, name?: string): Promise<number | null> {
    try {
      console.log('[SupabaseChatRoomAdapter] Creating room', { userId: session.user.id, model, name });

      // Generate unique name following /src pattern
      const randomSuffix = Math.random().toString(36).slice(2, 6);
      const defaultName = name || `Chat ${new Date().toLocaleString()} • ${randomSuffix}`;

      // Use upsert to gracefully handle rare race conditions creating the same name simultaneously
      const { data, error } = await supabase
        .from('chatrooms')
        .upsert(
          { 
            name: defaultName, 
            user_id: session.user.id, 
            model 
          },
          { onConflict: 'user_id,name' }
        )
        .select('id')
        .single();

      if (error || !data) {
        console.error('[SupabaseChatRoomAdapter] Failed to create chatroom:', error);
        return null;
      }

      console.log('[SupabaseChatRoomAdapter] Room created successfully', { roomId: data.id });
      return data.id;
    } catch (error) {
      console.error('[SupabaseChatRoomAdapter] Unexpected error creating room:', error);
      return null;
    }
  }

  async updateRoom(roomId: number, updates: RoomUpdateData, session: Session): Promise<void> {
    try {
      console.log('[SupabaseChatRoomAdapter] Updating room', { roomId, updates });

      const updateData: any = {};
      
      // Only update name if it's provided and not empty
      if (updates.name !== undefined && updates.name.trim()) {
        // Make the name unique by adding a timestamp to avoid constraint violations
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const uniqueName = `${updates.name.slice(0, 80)} - ${timestamp}`;
        updateData.name = uniqueName;
      }
      
      if (updates.model !== undefined) updateData.model = updates.model;
      if (updates.updated_at !== undefined) updateData.updated_at = updates.updated_at;

      // Only perform update if there are actual changes
      if (Object.keys(updateData).length === 0) {
        console.log('[SupabaseChatRoomAdapter] No changes to update');
        return;
      }

      const { error } = await supabase
        .from('chatrooms')
        .update(updateData)
        .eq('id', roomId)
        .eq('user_id', session.user.id); // Ensure user owns the room

      if (error) {
        console.error('[SupabaseChatRoomAdapter] Failed to update room:', error);
        // Don't throw error for room updates - they're not critical
        // Just log the error and continue
        console.warn('[SupabaseChatRoomAdapter] Room update failed, but continuing with flow');
        return;
      }

      console.log('[SupabaseChatRoomAdapter] Room updated successfully', { roomId });
    } catch (error) {
      console.error('[SupabaseChatRoomAdapter] Unexpected error updating room:', error);
      // Non-critical operation, don't throw
    }
  }

  async getRoom(roomId: number, session: Session): Promise<RoomData | null> {
    try {
      console.log('[SupabaseChatRoomAdapter] Getting room', { roomId });

      const { data, error } = await supabase
        .from('chatrooms')
        .select('id, name, model, user_id, created_at, updated_at')
        .eq('id', roomId)
        .eq('user_id', session.user.id) // Ensure user owns the room
        .single();

      if (error || !data) {
        console.error('[SupabaseChatRoomAdapter] Failed to get room:', error);
        return null;
      }

      console.log('[SupabaseChatRoomAdapter] Room retrieved successfully', { roomId });
      return {
        id: data.id,
        name: data.name,
        model: data.model,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('[SupabaseChatRoomAdapter] Unexpected error getting room:', error);
      return null;
    }
  }

  async deleteRoom(roomId: number, session: Session): Promise<void> {
    try {
      console.log('[SupabaseChatRoomAdapter] Deleting room', { roomId });

      // First delete messages (cascade delete) following /src pattern
      const { error: msgErr } = await supabase
        .from('messages')
        .delete()
        .eq('room_id', roomId);

      if (msgErr) {
        console.warn('[SupabaseChatRoomAdapter] Failed to delete messages:', msgErr);
      }

      // Then delete the room
      const { error: roomErr } = await supabase
        .from('chatrooms')
        .delete()
        .eq('id', roomId)
        .eq('user_id', session.user.id); // Ensure user owns the room

      if (roomErr) {
        console.error('[SupabaseChatRoomAdapter] Failed to delete room:', roomErr);
        throw roomErr;
      }

      console.log('[SupabaseChatRoomAdapter] Room deleted successfully', { roomId });
    } catch (error) {
      console.error('[SupabaseChatRoomAdapter] Error deleting room:', error);
      throw error;
    }
  }

  async listRooms(session: Session): Promise<RoomWithLastMessage[]> {
    try {
      console.log('[SupabaseChatRoomAdapter] Listing rooms for user', { userId: session.user.id });

      // First, get all chat rooms for the user following /src pattern
      const { data: allRoomRows, error: roomsError } = await supabase
        .from('chatrooms')
        .select('id, name, model, created_at, updated_at')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (roomsError || !allRoomRows) {
        console.warn('[SupabaseChatRoomAdapter] Error fetching rooms:', roomsError);
        return [];
      }

      const allRoomIds = allRoomRows.map(r => r.id);

      if (allRoomIds.length === 0) {
        console.log('[SupabaseChatRoomAdapter] No rooms found');
        return [];
      }

      // Get rooms that have messages
      const { data: roomsWithMessages } = await supabase
        .from('messages')
        .select('room_id')
        .in('room_id', allRoomIds);

      if (!roomsWithMessages || roomsWithMessages.length === 0) {
        console.log('[SupabaseChatRoomAdapter] No rooms with messages found');
        return allRoomRows.map(room => ({
          id: room.id,
          name: room.name,
          model: room.model,
          user_id: session.user.id,
          created_at: room.created_at,
          updated_at: room.updated_at,
        }));
      }

      // Get unique room IDs that have messages
      const roomIdsWithMessages = [...new Set(roomsWithMessages.map(m => m.room_id))];

      // Fetch latest user messages for rooms that have messages
      const { data: messageRows } = await supabase
        .from('messages')
        .select('room_id, content, created_at')
        .in('room_id', roomIdsWithMessages)
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      // Build map of first (latest) message per room
      const latestByRoom = new Map<number, { content?: string; created_at?: string }>();
      messageRows?.forEach(msg => {
        if (!latestByRoom.has(msg.room_id)) {
          latestByRoom.set(msg.room_id, { 
            content: msg.content as string, 
            created_at: msg.created_at as string 
          });
        }
      });

      // Map rooms with last message info
      const roomsWithLastMsg: RoomWithLastMessage[] = allRoomRows
        .filter(room => roomIdsWithMessages.includes(room.id))
        .map(room => {
          const lastMsg = latestByRoom.get(room.id);
          return {
            id: room.id,
            name: room.name,
            model: room.model,
            user_id: session.user.id,
            created_at: room.created_at,
            updated_at: room.updated_at,
            last_message: lastMsg?.content,
            last_activity: lastMsg?.created_at,
          };
        })
        .sort((a, b) => {
          // Sort by last activity, then by updated_at
          const aTime = a.last_activity || a.updated_at;
          const bTime = b.last_activity || b.updated_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

      console.log('[SupabaseChatRoomAdapter] Listed rooms successfully', { count: roomsWithLastMsg.length });
      return roomsWithLastMsg;
    } catch (error) {
      console.error('[SupabaseChatRoomAdapter] Unexpected error listing rooms:', error);
      return [];
    }
  }
}

import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../service/shared/lib/supabase';
import { MessageData } from '../mappers/MessageMapper';

export interface SaveResult {
  success: boolean;
  data?: MessageData;
  error?: string;
}

export interface GetMessagesResult {
  success: boolean;
  data?: MessageData[];
  error?: string;
}

export class SupabaseMessageAdapter {
  async save(messageData: MessageData, session: Session): Promise<void> {
    try {
      console.log(`[SupabaseMessageAdapter] Saving message: ${messageData.id}`);

      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: parseInt(messageData.room_id), // Convert string to number
          user_id: session.user.id, // Use session.user.id
          role: messageData.role,
          content: messageData.content,
          client_id: messageData.id, // Use the message ID as client_id
        });

      if (error) {
        console.error('[SupabaseMessageAdapter] Insert error:', error);
        throw error; // Throw error like the existing implementation
      }

      console.log(`[SupabaseMessageAdapter] Successfully saved message: ${messageData.id}`);

    } catch (error) {
      console.error('[SupabaseMessageAdapter] Unexpected error:', error);
      throw error; // Re-throw like existing implementation
    }
  }

  async getById(messageId: string, session: Session): Promise<MessageData | null> {
    try {
      console.log(`[SupabaseMessageAdapter] Getting message: ${messageId}`);

      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, client_id, created_at, room_id')
        .eq('client_id', messageId)
        .eq('user_id', session.user.id) // Ensure user owns the message
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        console.error('[SupabaseMessageAdapter] Query error:', error);
        return null;
      }

      console.log(`[SupabaseMessageAdapter] Found message: ${messageId}`);
      
      // Map to MessageData format
      return {
        id: data.client_id || `db:${data.id}`,
        content: data.content,
        role: data.role,
        timestamp: data.created_at,
        room_id: data.room_id.toString(),
        user_id: session.user.id,
        is_deleted: false,
        metadata: null
      };

    } catch (error) {
      console.error('[SupabaseMessageAdapter] Unexpected error:', error);
      return null;
    }
  }

  async getByRoomId(roomId: string, session: Session): Promise<MessageData[]> {
    try {
      console.log(`[SupabaseMessageAdapter] Loading messages for room: ${roomId}`);

      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, client_id, created_at')
        .eq('room_id', parseInt(roomId)) // Convert string to number
        .eq('user_id', session.user.id) // Ensure user owns the messages
        .order('id', { ascending: true }); // Match existing order

      if (error) {
        console.error('[SupabaseMessageAdapter] Query error:', error);
        return []; // Return empty array like existing implementation
      }

      console.log(`[SupabaseMessageAdapter] Loaded ${data?.length || 0} messages`);
      
      // Map to MessageData format
      return (data || []).map(row => ({
        id: row.client_id || `db:${row.id}`, // Use client_id or generate db:id
        content: row.content,
        role: row.role,
        timestamp: row.created_at,
        room_id: roomId, // Keep as string for our format
        user_id: session.user.id,
        is_deleted: false,
        metadata: null
      }));

    } catch (error) {
      console.error('[SupabaseMessageAdapter] Unexpected error:', error);
      return []; // Return empty array like existing implementation
    }
  }

  async getRecentByRoomId(roomId: string, limit: number, session: Session): Promise<GetMessagesResult> {
    try {
      console.log(`[SupabaseMessageAdapter] Loading recent messages for room: ${roomId}, limit: ${limit}`);

      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, client_id, created_at')
        .eq('room_id', parseInt(roomId)) // Convert string to number
        .eq('user_id', session.user.id) // Ensure user owns the messages
        .order('id', { ascending: false }) // Get most recent first
        .limit(limit); // Apply limit

      if (error) {
        console.error('[SupabaseMessageAdapter] Query error:', error);
        return { success: false, error: 'Failed to load recent messages' };
      }

      console.log(`[SupabaseMessageAdapter] Loaded ${data?.length || 0} recent messages`);
      
      // Map to MessageData format and reverse to get chronological order
      const messages = (data || []).reverse().map(row => ({
        id: row.client_id || `db:${row.id}`, // Use client_id or generate db:id
        content: row.content,
        role: row.role,
        timestamp: row.created_at,
        room_id: roomId, // Keep as string for our format
        user_id: session.user.id,
        is_deleted: false,
        metadata: null
      }));

      return { success: true, data: messages };

    } catch (error) {
      console.error('[SupabaseMessageAdapter] Unexpected error:', error);
      return { success: false, error: 'Unexpected error loading recent messages' };
    }
  }

  async update(messageData: MessageData, session: Session): Promise<void> {
    try {
      console.log(`[SupabaseMessageAdapter] Updating message: ${messageData.id}`);

      const { error } = await supabase
        .from('messages')
        .update({
          content: messageData.content,
          updated_at: new Date().toISOString(),
        })
        .eq('client_id', messageData.id)
        .eq('user_id', session.user.id); // Ensure user owns the message

      if (error) {
        console.error('[SupabaseMessageAdapter] Update error:', error);
        throw error;
      }

      console.log(`[SupabaseMessageAdapter] Successfully updated message: ${messageData.id}`);

    } catch (error) {
      console.error('[SupabaseMessageAdapter] Unexpected error:', error);
      throw error;
    }
  }

  async delete(messageId: string, session: Session): Promise<void> {
    try {
      console.log(`[SupabaseMessageAdapter] Deleting message: ${messageId}`);

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('client_id', messageId)
        .eq('user_id', session.user.id); // Ensure user owns the message

      if (error) {
        console.error('[SupabaseMessageAdapter] Delete error:', error);
        throw error;
      }

      console.log(`[SupabaseMessageAdapter] Successfully deleted message: ${messageId}`);

    } catch (error) {
      console.error('[SupabaseMessageAdapter] Unexpected error:', error);
      throw error;
    }
  }
}

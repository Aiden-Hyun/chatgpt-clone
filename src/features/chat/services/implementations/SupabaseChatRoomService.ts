// src/features/chat/services/implementations/SupabaseChatRoomService.ts
import { supabase } from '../../../../shared/lib/supabase';
import { IChatRoomService } from '../interfaces/IChatRoomService';
import { createChatRoom } from '../legacy/createChatRoom';

export class SupabaseChatRoomService implements IChatRoomService {
  async createRoom(userId: string, model: string): Promise<number | null> {
    return createChatRoom(userId, model);
  }

  async updateRoom(roomId: number, updates: {
    name?: string;
    model?: string;
    updatedAt?: string;
  }): Promise<void> {
    const updateData: any = {};
    
    // Only update name if it's provided and not empty
    if (updates.name !== undefined && updates.name.trim()) {
      // Make the name unique by adding a timestamp to avoid constraint violations
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const uniqueName = `${updates.name.slice(0, 80)} - ${timestamp}`;
      updateData.name = uniqueName;
    }
    
    if (updates.model !== undefined) updateData.model = updates.model;
    if (updates.updatedAt !== undefined) updateData.updated_at = updates.updatedAt;

    // Only perform update if there are actual changes
    if (Object.keys(updateData).length === 0) {
      return;
    }

    const { error } = await supabase
      .from('chatrooms')
      .update(updateData)
      .eq('id', roomId);

    if (error) {
      console.error('Failed to update room:', error);
      // Don't throw error for room updates - they're not critical
      // Just log the error and continue
      console.warn('Room update failed, but continuing with message flow');
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
      .from('chatrooms')
      .select('id, name, model, created_at, updated_at')
      .eq('id', roomId)
      .single();

    if (error || !data) {
      console.error('Failed to get room:', error);
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

  async deleteRoom(roomId: number): Promise<void> {
    const { error } = await supabase
      .from('chatrooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      console.error('Failed to delete room:', error);
      throw error;
    }
  }
} 
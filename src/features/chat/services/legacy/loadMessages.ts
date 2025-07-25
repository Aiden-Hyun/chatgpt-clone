// src/features/chat/services/legacy/loadMessages.ts
// Original implementation - moved to legacy folder
import { supabase } from '../../../../shared/lib/supabase';
import { ChatMessage } from '../types';

export const loadMessages = async (roomId: number | null): Promise<ChatMessage[]> => {
  if (!roomId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('role, content')
    .eq('room_id', roomId)
    .order('id', { ascending: true });

  if (error || !data) {
    console.error('Failed to load messages:', error);
    return [];
  }

  return data as ChatMessage[];
}; 
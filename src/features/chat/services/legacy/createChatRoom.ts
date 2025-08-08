// src/features/chat/services/legacy/createChatRoom.ts
// Original implementation - moved to legacy folder
import { supabase } from '../../../../shared/lib/supabase';

export const createChatRoom = async (
  userId: string,
  model: string = 'gpt-3.5-turbo'
): Promise<number | null> => {
  // NOTE: Room creation should occur only after a successful AI response to avoid
  // saving empty chatrooms. The calling code ensures this sequencing.
  const defaultName = `Chat ${new Date().toLocaleString()}`;

  const { data, error } = await supabase
    .from('chatrooms')
    .insert({ name: defaultName, user_id: userId, model })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Failed to create chatroom:', error);
    return null;
  }

  return data.id;
};
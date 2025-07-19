// src/services/chat/createChatRoom.ts
import { supabase } from '../../supabase';

export const createChatRoom = async (
  userId: string,
  model: string = 'gpt-3.5-turbo'
): Promise<number | null> => {
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

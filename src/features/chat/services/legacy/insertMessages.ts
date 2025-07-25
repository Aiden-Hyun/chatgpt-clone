// src/features/chat/services/legacy/insertMessages.ts
// Original implementation - moved to legacy folder
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../../shared/lib/supabase';
import { ChatMessage } from '../types';

type InsertMessagesArgs = {
  roomId: number;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  session: Session;
};

/**
 * Inserts user and assistant messages into the database
 */
export const insertMessages = async ({
  roomId,
  userMessage,
  assistantMessage,
  session,
}: InsertMessagesArgs): Promise<void> => {
  try {
    const { error } = await supabase.from('messages').insert([
      {
        room_id: roomId,
        user_id: session.user.id,
        role: 'user',
        content: userMessage.content,
      },
      {
        room_id: roomId,
        user_id: session.user.id,
        role: 'assistant',
        content: assistantMessage.content,
      },
    ]);
    
    if (error) {
      console.error('❌ Failed to insert messages:', error);
    }
  } catch (e) {
    console.error('❌ Unexpected error inserting messages:', e);
  }
}; 
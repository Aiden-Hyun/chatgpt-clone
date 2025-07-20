// src/features/chat/services/updateAssistantMessage.ts
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabase';

type UpdateAssistantMessageArgs = {
  roomId: number;
  content: string;
  session: Session;
};

/**
 * Updates an existing assistant message in the database
 * Used specifically for the regeneration flow
 */
export const updateAssistantMessage = async ({
  roomId,
  content,
  session,
}: UpdateAssistantMessageArgs): Promise<void> => {
  try {
    // First, find the most recent assistant message in this room
    const { data: existingMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('room_id', roomId)
      .eq('role', 'assistant')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!existingMessages || existingMessages.length === 0) {
      console.error('⚠️ No assistant message found to update');
      return;
    }
    
    const messageId = existingMessages[0].id;
    
    // Update the message with the new content and explicitly set updated_at
    const { error } = await supabase
      .from('messages')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);
    
    if (error) {
      console.error('❌ Failed to update assistant message:', error);
    } else {
      console.log(`✅ Updated assistant message with ID: ${messageId}`);
    }
  } catch (e) {
    console.error('❌ Unexpected error updating assistant message:', e);
  }
};

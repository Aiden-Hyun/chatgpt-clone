// src/features/chat/services/updateAssistantMessage.ts
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabase';

type UpdateAssistantMessageArgs = {
  roomId: number;
  /** New regenerated assistant content */
  newContent: string;
  /** The original assistant content we are replacing */
  originalContent: string;
  session: Session;
};

/**
 * Updates an existing assistant message in the database
 * Used specifically for the regeneration flow
 */
export const updateAssistantMessage = async ({
  roomId,
  newContent,
  originalContent,
  session,
}: UpdateAssistantMessageArgs): Promise<void> => {
  try {
    // Match by the OLD assistant content so we touch the correct row
    const { data: target } = await supabase
      .from('messages')
      .select('id')
      .eq('room_id', roomId)
      .eq('role', 'assistant')
      .eq('user_id', session.user.id)
      .eq('content', originalContent)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!target || target.length === 0) {
      console.error('⚠️ No assistant message found to update');
      return;
    }
    
    const messageId = target[0].id;
    
    // Update the message with the new content and explicitly set updated_at
    const { error } = await supabase
      .from('messages')
      .update({
        content: newContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);
    
    if (error) {
      console.error('❌ Failed to update regenerated assistant message:', error);
    } else {
      console.log(`✅ Regenerated assistant message updated (ID: ${messageId})`);
    }
  } catch (e) {
    console.error('❌ Unexpected error updating assistant message:', e);
  }
};

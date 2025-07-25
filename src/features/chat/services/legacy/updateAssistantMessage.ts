// src/features/chat/services/legacy/updateAssistantMessage.ts
// Original implementation - moved to legacy folder
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../../shared/lib/supabase';

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
 */
export const updateAssistantMessage = async ({
  roomId,
  newContent,
  originalContent,
  session,
}: UpdateAssistantMessageArgs): Promise<void> => {
  try {
    // First, find the message to update
    const { data: messages, error: findError } = await supabase
      .from('messages')
      .select('id')
      .eq('room_id', roomId)
      .eq('role', 'assistant')
      .eq('content', originalContent)
      .order('created_at', { ascending: false })
      .limit(1);

    if (findError || !messages || messages.length === 0) {
      console.error('❌ Failed to find message to update:', findError);
      return;
    }

    const messageId = messages[0].id;

    // Update the message
    const { error: updateError } = await supabase
      .from('messages')
      .update({
        content: newContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (updateError) {
      console.error('❌ Failed to update message:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('❌ Error updating assistant message:', error);
    throw error;
  }
}; 
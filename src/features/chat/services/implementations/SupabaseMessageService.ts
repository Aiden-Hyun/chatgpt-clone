// src/features/chat/services/implementations/SupabaseMessageService.ts
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../../shared/lib/supabase';
import { IMessageService } from '../interfaces/IMessageService';
import { ChatMessage } from '../types';

export class SupabaseMessageService implements IMessageService {
  async insertMessages(args: {
    roomId: number;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    session: Session;
  }): Promise<void> {
    // Consolidated from legacy/insertMessages.ts
    try {
      const { error } = await supabase.from('messages').insert([
        {
          room_id: args.roomId,
          user_id: args.session.user.id,
          role: 'user',
          content: args.userMessage.content,
        },
        {
          room_id: args.roomId,
          user_id: args.session.user.id,
          role: 'assistant',
          content: args.assistantMessage.content,
        },
      ]);
      
      if (error) {
        console.error('❌ Failed to insert messages:', error);
      }
    } catch (e) {
      console.error('❌ Unexpected error inserting messages:', e);
    }
  }

  async updateAssistantMessage(args: {
    roomId: number;
    newContent: string;
    originalContent: string;
    session: Session;
  }): Promise<void> {
    // Consolidated from legacy/updateAssistantMessage.ts
    try {
      // First, find the message to update
      const { data: messages, error: findError } = await supabase
        .from('messages')
        .select('id')
        .eq('room_id', args.roomId)
        .eq('role', 'assistant')
        .eq('content', args.originalContent)
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
          content: args.newContent,
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
  }

  async loadMessages(roomId: number): Promise<ChatMessage[]> {
    // Consolidated from legacy/loadMessages.ts
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
  }

  async deleteMessages(roomId: number): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      console.error('Failed to delete messages:', error);
      throw error;
    }
  }
} 
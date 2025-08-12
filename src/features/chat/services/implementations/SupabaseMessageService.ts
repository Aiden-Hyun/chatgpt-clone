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
      // Build assistant row (avoid optional columns for maximum compatibility)
      const assistantRow: any = {
        room_id: args.roomId,
        user_id: args.session.user.id,
        role: 'assistant',
        content: args.assistantMessage.content,
      };

      const { error } = await supabase.from('messages').insert([
        {
          room_id: args.roomId,
          user_id: args.session.user.id,
          role: 'user',
          content: args.userMessage.content,
        },
        assistantRow,
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

  /**
   * Update assistant message by client_id if available (more robust than content matching)
   */
  async updateAssistantMessageByClientId(args: {
    roomId: number;
    messageId: string; // client_id stored with message
    newContent: string;
    session: Session;
  }): Promise<boolean> {
    try {
      const { data: messages, error: findError } = await supabase
        .from('messages')
        .select('id')
        .eq('room_id', args.roomId)
        .eq('role', 'assistant')
        .eq('client_id', args.messageId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (findError || !messages || messages.length === 0) {
        return false;
      }

      const messageId = messages[0].id;
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          content: args.newContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (updateError) {
        console.error('❌ Failed to update message by client_id:', updateError);
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Error updating assistant message by client_id:', error);
      return false;
    }
  }

  async updateAssistantMessageByDbId(args: {
    dbId: number;
    newContent: string;
    session: Session;
  }): Promise<boolean> {
    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          content: args.newContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', args.dbId);
      if (updateError) {
        console.error('❌ Failed to update message by db id:', updateError);
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Error updating assistant message by db id:', error);
      return false;
    }
  }

  async loadMessages(roomId: number): Promise<ChatMessage[]> {
    // Consolidated from legacy/loadMessages.ts
    if (!roomId) {
      if (__DEV__) {
        console.log('⚠️ [DB-SERVICE] No roomId provided, returning empty array');
      }
      return [];
    }

    if (__DEV__) {
      console.log(`📊 [DB-SERVICE] Executing SQL query for room ${roomId}`, {
        query: 'SELECT role, content FROM messages WHERE room_id = ? ORDER BY id ASC',
        roomId,
        timestamp: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content')
      .eq('room_id', roomId)
      .order('id', { ascending: true });

    if (error) {
      console.error(`❌ [DB-SERVICE] Database error for room ${roomId}:`, error);
      return [];
    }
    
    if (!data) {
      console.warn(`⚠️ [DB-SERVICE] No data returned for room ${roomId}`);
      return [];
    }

    if (__DEV__) {
      console.log(`✅ [DB-SERVICE] Successfully loaded ${data.length} messages for room ${roomId}`, {
        messages: data.map((msg, index) => ({
          index,
          role: msg.role,
          contentPreview: msg.content?.substring(0, 50) + '...'
        }))
      });
    }

    // Map DB rows to ChatMessage with a stable identifier
    const mapped: ChatMessage[] = (data as any[]).map((row) => {
      const id: string | undefined = (typeof row.id === 'number' || typeof row.id === 'string')
        ? `db:${row.id}`
        : undefined;
      return {
        role: row.role,
        content: row.content,
        id,
      } as ChatMessage;
    });
    return mapped;
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
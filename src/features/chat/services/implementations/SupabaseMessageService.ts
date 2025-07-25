// src/features/chat/services/implementations/SupabaseMessageService.ts
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../../shared/lib/supabase';
import { IMessageService } from '../interfaces/IMessageService';
import { insertMessages } from '../legacy/insertMessages';
import { loadMessages } from '../legacy/loadMessages';
import { updateAssistantMessage } from '../legacy/updateAssistantMessage';
import { ChatMessage } from '../types';

export class SupabaseMessageService implements IMessageService {
  async insertMessages(args: {
    roomId: number;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    session: Session;
  }): Promise<void> {
    return insertMessages(args);
  }

  async updateAssistantMessage(args: {
    roomId: number;
    newContent: string;
    originalContent: string;
    session: Session;
  }): Promise<void> {
    return updateAssistantMessage(args);
  }

  async loadMessages(roomId: number): Promise<ChatMessage[]> {
    return loadMessages(roomId);
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
// Supabase adapter - handles low-level database operations
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatRoomRow, MessageRow } from '../../database/types/DatabaseTypes';

export class SupabaseAdapter {
  private static instance: SupabaseAdapter;
  private client: SupabaseClient;

  private constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  static getInstance(): SupabaseAdapter {
    if (!SupabaseAdapter.instance) {
      SupabaseAdapter.instance = new SupabaseAdapter();
    }
    return SupabaseAdapter.instance;
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  // Message operations
  async insertMessages(messages: Partial<MessageRow>[]): Promise<MessageRow[]> {
    const { data, error } = await this.client
      .from('messages')
      .insert(messages)
      .select();

    if (error) {
      throw new Error(`Failed to insert messages: ${error.message}`);
    }

    return data || [];
  }

  async selectMessages(roomId: number): Promise<MessageRow[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('id, role, content, client_id, created_at, updated_at')
      .eq('room_id', roomId)
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Failed to load messages: ${error.message}`);
    }

    return data || [];
  }

  async updateMessage(id: number, updates: Partial<MessageRow>): Promise<MessageRow | null> {
    const { data, error } = await this.client
      .from('messages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update message: ${error.message}`);
    }

    return data;
  }

  async deleteMessages(roomId: number): Promise<void> {
    const { error } = await this.client
      .from('messages')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      throw new Error(`Failed to delete messages: ${error.message}`);
    }
  }

  // Chat room operations
  async insertChatRoom(room: Partial<ChatRoomRow>): Promise<ChatRoomRow> {
    const { data, error } = await this.client
      .from('chatrooms')
      .insert(room)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat room: ${error.message}`);
    }

    return data;
  }

  async selectChatRooms(userId: string): Promise<ChatRoomRow[]> {
    const { data, error } = await this.client
      .from('chatrooms')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load chat rooms: ${error.message}`);
    }

    return data || [];
  }

  async selectChatRoom(id: number, userId: string): Promise<ChatRoomRow | null> {
    const { data, error } = await this.client
      .from('chatrooms')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      throw new Error(`Failed to load chat room: ${error.message}`);
    }

    return data;
  }

  async updateChatRoom(id: number, userId: string, updates: Partial<ChatRoomRow>): Promise<ChatRoomRow | null> {
    const { data, error } = await this.client
      .from('chatrooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chat room: ${error.message}`);
    }

    return data;
  }

  async deleteChatRoom(id: number, userId: string): Promise<boolean> {
    const { error } = await this.client
      .from('chatrooms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete chat room: ${error.message}`);
    }

    return true;
  }

  // Auth operations
  async getCurrentSession() {
    const { data: { session }, error } = await this.client.auth.getSession();
    
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }

    return session;
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }

    return data;
  }

  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password
    });

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }

    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  async resetPassword(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }
}

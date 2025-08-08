import { GLOBAL_EVENT_TYPES, GlobalEvents } from '../../../../shared/lib/globalEvents';
import { supabase } from '../../../../shared/lib/supabase';

export class PersistenceService {
  async createRoom(params: { session: any; model?: string; initialName?: string }): Promise<number> {
    const { session, model, initialName } = params;
    if (!session || !session.user?.id) throw new Error('No active session');
    const userId = session.user.id as string;
    const { data, error } = await supabase
      .from('chatrooms')
      .insert({ user_id: userId, name: (initialName?.slice(0, 100)) || `Chat ${new Date().toLocaleString()}`, model: model || 'gpt-3.5-turbo' })
      .select('id')
      .single();
    if (error || !data) throw error || new Error('Failed to create chat room');
    const newId = data.id as number;
    try { GlobalEvents.emit(GLOBAL_EVENT_TYPES.ROOMS_CREATED, { roomId: newId, name: initialName?.slice(0, 100) }); } catch {}
    return newId;
  }

  async persistFirstTurn(params: {
    session: any;
    model: string | undefined;
    numericRoomId: number | null | undefined;
    userContent: string;
    assistantContent: string;
  }): Promise<number> {
    const { session, model, numericRoomId, userContent, assistantContent } = params;
    if (!session || !session.user?.id) {
      throw new Error('No active session');
    }

    const userId = session.user.id as string;

    // If we already have a room, just insert messages
    let roomId = numericRoomId ?? null;

    if (!roomId) {
      const { data, error } = await supabase
        .from('chatrooms')
        .insert({ user_id: userId, name: `Chat ${new Date().toLocaleString()}`, model: model || 'gpt-3.5-turbo' })
        .select('id')
        .single();
      if (error || !data) {
        throw new Error('Failed to create chat room');
      }
      roomId = data.id as number;
    }

    // Insert user and assistant messages as a pair
    const { error: msgErr } = await supabase.from('messages').insert([
      { room_id: roomId, user_id: userId, role: 'user', content: userContent },
      { room_id: roomId, user_id: userId, role: 'assistant', content: assistantContent },
    ]);
    if (msgErr) {
      throw msgErr;
    }

    // Update room metadata (best-effort)
    await supabase
      .from('chatrooms')
      .update({ name: userContent.slice(0, 100), updated_at: new Date().toISOString(), model: model })
      .eq('id', roomId);

    return roomId;
  }

  async persistTurn(params: {
    session: any;
    roomId: number;
    userContent?: string;
    assistantContent?: string;
  }): Promise<void> {
    const { session, roomId, userContent, assistantContent } = params;
    if (!session || !session.user?.id) throw new Error('No active session');
    const userId = session.user.id as string;

    const rows: Array<{ room_id: number; user_id: string; role: 'user' | 'assistant'; content: string }> = [];
    if (userContent && userContent.trim()) rows.push({ room_id: roomId, user_id: userId, role: 'user', content: userContent });
    if (assistantContent && assistantContent.trim()) rows.push({ room_id: roomId, user_id: userId, role: 'assistant', content: assistantContent });
    if (rows.length === 0) return;

    const { error } = await supabase.from('messages').insert(rows);
    if (error) throw error;

    await supabase
      .from('chatrooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId);
  }

  async deleteRoom(params: { session: any; roomId: number }): Promise<void> {
    const { session, roomId } = params;
    if (!session || !session.user?.id) throw new Error('No active session');
    await supabase.from('chatrooms').delete().eq('id', roomId).eq('user_id', session.user.id);
  }
}



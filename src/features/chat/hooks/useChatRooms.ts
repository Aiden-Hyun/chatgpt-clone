import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { GLOBAL_EVENT_TYPES, GlobalEvents } from '../../../shared/lib/globalEvents';
import { supabase } from '../../../shared/lib/supabase';

export interface ChatRoom { id: number; name: string; }
export interface ChatRoomWithLastMsg { id: number; name: string; }

export const useChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoomWithLastMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    console.log('[ROOMS] fetchRooms:start');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('[ROOMS] fetchRooms:no-session');
      router.replace('/login');
      return;
    }

    // First, get all chat rooms for the user
    console.log('[ROOMS] fetchRooms:query chatrooms');
    const { data: allRoomRows, error: roomsError } = await supabase
      .from('chatrooms')
      .select('id')
      .eq('user_id', session.user.id);

    if (roomsError || !allRoomRows) {
      console.warn('[ROOMS] fetchRooms:rooms error', roomsError);
      setLoading(false);
      return;
    }

    const allRoomIds = allRoomRows.map(r => r.id);
    console.log('[ROOMS] fetchRooms:roomIds', allRoomIds.length);
    if (allRoomIds.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    // Get rooms that have messages
    console.log('[ROOMS] fetchRooms:query messages for rooms');
    const { data: roomsWithMessages } = await supabase
      .from('messages')
      .select('room_id')
      .in('room_id', allRoomIds);

    if (!roomsWithMessages || roomsWithMessages.length === 0) {
      console.log('[ROOMS] fetchRooms:no rooms with messages');
      setRooms([]);
      setLoading(false);
      return;
    }

    // Get unique room IDs that have messages
    const roomIdsWithMessages = [...new Set(roomsWithMessages.map(m => m.room_id))];
    console.log('[ROOMS] fetchRooms:roomsWithMessages', roomIdsWithMessages.length);

    // Fetch latest user messages for rooms that have messages
    console.log('[ROOMS] fetchRooms:query latest user messages');
    const { data: messageRows } = await supabase
      .from('messages')
      .select('room_id, content, created_at')
      .in('room_id', roomIdsWithMessages)
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    // Build map of first (latest) message per room
    const latestByRoom = new Map<number, string>();
    messageRows?.forEach(msg => {
      if (!latestByRoom.has(msg.room_id)) {
        latestByRoom.set(msg.room_id, msg.content as string);
      }
    });

    const mapped: ChatRoomWithLastMsg[] = roomIdsWithMessages.map(roomId => ({
      id: roomId,
      name: latestByRoom.get(roomId) || 'New Chat',
    }));

    setRooms(mapped);
    setLoading(false);
    console.log('[ROOMS] fetchRooms:done', { count: mapped.length });
  }, []);

  useEffect(() => {
    fetchRooms();
    // Local event fallback if Realtime is not emitting
    const off = GlobalEvents.on(GLOBAL_EVENT_TYPES.ROOMS_CREATED, async (payload: any) => {
      const roomId = payload?.roomId as number | undefined;
      const name = payload?.name as string | undefined;
      if (!roomId) return;
      console.log('[ROOMS] global-created', roomId);
      // Merge room if missing
      const { data: roomRow } = await supabase
        .from('chatrooms')
        .select('id, name, updated_at')
        .eq('id', roomId)
        .maybeSingle();
      setRooms(prev => (prev.some(r => r.id === roomId) ? prev : [{ id: roomId, name: name || roomRow?.name || 'New Chat' }, ...prev]));
    });
    // Realtime: listen for message inserts to reflect new rooms instantly
    let channel: any;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      channel = supabase
        .channel('rooms-message-inserts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${session.user.id}` }, async (payload) => {
          try {
            const roomId = (payload.new as any).room_id as number;
            console.log('[ROOMS-RT] insert for room', roomId);
            // Fetch room metadata
            const { data: roomRow } = await supabase
              .from('chatrooms')
              .select('id, name, updated_at')
              .eq('id', roomId)
              .maybeSingle();
            // Merge without duplicate using prev snapshot
            setRooms(prev => {
              if (prev.some(r => r.id === roomId)) return prev;
              const next = [{ id: roomId, name: roomRow?.name || 'New Chat' }, ...prev];
              console.log('[ROOMS-RT] merged room', roomId, '→ total', next.length);
              return next;
            });
          } catch (e) {
            // Fallback: trigger full fetch
            fetchRooms();
          }
        })
        .subscribe();
      setSubscriptionId('rooms-message-inserts');
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
      off?.();
    };
  }, [fetchRooms]);

  const deleteRoom = async (roomId: number) => {
    console.log('[ROOMS] deleteRoom:start', { roomId });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { error: msgErr } = await supabase.from('messages').delete().eq('room_id', roomId);
      if (msgErr) console.warn('[ROOMS] deleteRoom:messages error', msgErr);
      const { error: roomErr } = await supabase
        .from('chatrooms')
        .delete()
        .eq('id', roomId)
        .eq('user_id', session.user.id);
      if (roomErr) {
        console.warn('[ROOMS] deleteRoom:chatrooms error', roomErr);
        return;
      }
      setRooms(prev => prev.filter(room => room.id !== roomId));
      console.log('[ROOMS] deleteRoom:done', { roomId });
    } catch (e) {
      console.warn('[ROOMS] deleteRoom:exception', e);
      return;
    }
  };

  const startNewChat = () => {
    router.push('/chat');
  };

  return {
    rooms,
    loading,
    fetchRooms,
    deleteRoom,
    startNewChat,
  };
};

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';

export interface ChatRoom { id: number; name: string; }
export interface ChatRoomWithLastMsg { id: number; name: string; }

export const useChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoomWithLastMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }

    // Clean up empty rooms first
    await cleanupEmptyRooms(session.user.id);

    // First, get all chat rooms for the user
    const { data: allRoomRows, error: roomsError } = await supabase
      .from('chatrooms')
      .select('id')
      .eq('user_id', session.user.id);

    if (roomsError || !allRoomRows) {
      setLoading(false);
      return;
    }

    const allRoomIds = allRoomRows.map(r => r.id);
    if (allRoomIds.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    // Get rooms that have messages
    const { data: roomsWithMessages } = await supabase
      .from('messages')
      .select('room_id')
      .in('room_id', allRoomIds);

    if (!roomsWithMessages || roomsWithMessages.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    // Get unique room IDs that have messages
    const roomIdsWithMessages = [...new Set(roomsWithMessages.map(m => m.room_id))];

    // Fetch latest user messages for rooms that have messages
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
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const deleteRoom = async (roomId: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('messages').delete().eq('room_id', roomId);
    const { error } = await supabase.from('chatrooms').delete().eq('id', roomId).eq('user_id', session.user.id);
    if (!error) {
      setRooms(prev => prev.filter(room => room.id !== roomId));
    }
  };

  const startNewChat = () => {
    router.push('/(tabs)/(chat)');
  };

  return {
    rooms,
    loading,
    fetchRooms,
    deleteRoom,
    startNewChat,
  };
};

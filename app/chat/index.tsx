import { useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../src/shared/lib/supabase';
import { LoadingWrapper } from '../../src/shared/components';

export default function NewChatScreen() {
  useEffect(() => {
    const createNewChat = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        // Create a new chat room
        const { data: newRoom, error } = await supabase
          .from('chatrooms')
          .insert({
            user_id: session.user.id,
            name: 'New Chat',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating new chat room:', error);
          router.replace('/');
          return;
        }

        // Navigate to the new chat room
        router.replace(`/chat/${newRoom.id}`);
      } catch (error) {
        console.error('Error in createNewChat:', error);
        router.replace('/');
      }
    };

    createNewChat();
  }, []);

  return <LoadingWrapper loading={true} />;
} 
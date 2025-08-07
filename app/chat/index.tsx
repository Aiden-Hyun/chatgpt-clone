import { router } from 'expo-router';
import { useEffect } from 'react';
import { LoadingWrapper } from '../../src/features/ui';
import { supabase } from '../../src/shared/lib/supabase';

export default function NewChatScreen() {
  useEffect(() => {
    const createNewChat = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/auth');
          return;
        }

        // Generate a temporary room ID for new chat
        // This will be replaced with a real database ID when first message is sent
        const tempRoomId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Navigate to the temporary chat room
        // The actual database room will be created when the first message is sent
        router.replace(`/chat/${tempRoomId}`);
      } catch (error) {
        router.replace('/');
      }
    };

    createNewChat();
  }, []);

  return <LoadingWrapper loading={true} />;
} 
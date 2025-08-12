import { LoadingWrapper } from '@/components/LoadingWrapper';
import { useAuth } from '@/features/auth';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function NewChatScreen() {
  const { session } = useAuth();


  useEffect(() => {
    const createNewChat = async () => {
      try {
        // Check current session
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
        console.error('Error in createNewChat:', error);
        router.replace('/');
      }
    };

    createNewChat();
  }, [session]);

  return <LoadingWrapper loading={true} />;
} 
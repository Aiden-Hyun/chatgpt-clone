import { LoadingWrapper } from '@/components/LoadingWrapper';
import { useAuth } from '@/features/auth';
import { DEFAULT_MODEL } from '@/features/chat/constants';
import { ServiceFactory } from '@/features/chat/services/core';
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

        // Create a real room up front and navigate directly to it
        const chatRoomService = ServiceFactory.createChatRoomService();
        const newRoomId = await chatRoomService.createRoom(session.user.id, DEFAULT_MODEL);

        if (!newRoomId) {
          throw new Error('Failed to create new chat room');
        }

        router.replace(`/chat/${newRoomId}`);
      } catch (error) {
        console.error('Error in createNewChat:', error);
        router.replace('/');
      }
    };

    createNewChat();
  }, [session]);

  return (
    <LoadingWrapper loading={true}>
      <></>
    </LoadingWrapper>
  );
} 
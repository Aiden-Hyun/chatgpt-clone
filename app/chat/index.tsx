import { LoadingWrapper } from '@/components/LoadingWrapper';
import { useAuth } from '@/features/auth';
import { DEFAULT_MODEL } from '@/features/chat/constants';
import { ServiceFactory } from '@/features/chat/services/core';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function NewChatScreen() {
  const { session, isLoading } = useAuth();
  const hasAttemptedCreation = useRef(false);

  useEffect(() => {
    const createNewChat = async () => {
      // Prevent multiple attempts
      if (hasAttemptedCreation.current) {
        return;
      }

      try {
        // Wait for auth to finish loading
        if (isLoading) {
          return;
        }

        // Check current session
        if (!session) {
          console.log('[NewChatScreen] No session, redirecting to auth');
          router.replace('/auth');
          return;
        }

        hasAttemptedCreation.current = true;

        // Create a real room up front and navigate directly to it
        const chatRoomService = ServiceFactory.createChatRoomService();
        const newRoomId = await chatRoomService.createRoom(session.user.id, DEFAULT_MODEL);

        if (!newRoomId) {
          throw new Error('Failed to create new chat room');
        }

        console.log('[NewChatScreen] Successfully created room:', newRoomId);
        router.replace(`/chat/${newRoomId}`);
      } catch (error) {
        console.error('Error in createNewChat:', error);
        
        // If we get a 401 or permission error, redirect to auth
        if (error instanceof Error && (
          error.message.includes('401') || 
          error.message.includes('permission denied') ||
          error.message.includes('Unauthorized')
        )) {
          console.log('[NewChatScreen] Auth error detected, redirecting to auth');
          router.replace('/auth');
        } else {
          // For other errors, go back to home
          router.replace('/');
        }
      }
    };

    createNewChat();
  }, [session, isLoading]);

  return (
    <LoadingWrapper loading={true}>
      <></>
    </LoadingWrapper>
  );
} 
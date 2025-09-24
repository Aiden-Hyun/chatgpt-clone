import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useAuth } from '../../../auth/context/AuthContext';
import { useRoomCreation } from '../../../chat/hooks/useRoomCreation';
import { LoadingWrapper } from '../../../components/LoadingWrapper';
import { DEFAULT_MODEL } from '../../../interfaces/chat';

/**
 * NewChatScreen - Creates a new chat room and redirects to it
 * Handles only presentation concerns, delegating business logic to hooks
 */
export default function NewChatScreen() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { createRoom } = useRoomCreation();
  const hasAttemptedCreation = useRef(false);
  const [isCreating, setIsCreating] = useState(false);

  // Handle room creation when screen is focused
  useFocusEffect(
    useCallback(() => {
      const createNewChat = async () => {
        // Prevent multiple attempts
        if (hasAttemptedCreation.current) {
          return;
        }

        try {
          // Wait for auth to finish loading
          if (isAuthLoading) {
            return;
          }

          // Check current session
          if (!session) {
            router.replace('/auth');
            return;
          }

          hasAttemptedCreation.current = true;
          setIsCreating(true);

          // Create room using the business layer
          const result = await createRoom(DEFAULT_MODEL, session);

          if (!result.success || !result.room) {
            throw new Error('Failed to create new chat room');
          }

          // Navigate to the new room
          router.replace(`/chat/${result.room.id}`);
        } catch (error) {
          console.error('Error in createNewChat:', error);
          hasAttemptedCreation.current = false;

          // Handle auth errors
          if (error instanceof Error && (
            error.message.includes('401') ||
            error.message.includes('permission denied') ||
            error.message.includes('Unauthorized')
          )) {
            router.replace('/auth');
          }
        } finally {
          setIsCreating(false);
        }
      };

      // Reset the guard and create room
      hasAttemptedCreation.current = false;
      createNewChat();
    }, [session, isAuthLoading, createRoom])
  );

  // Show loading only when auth is loading or when we're creating a room
  const shouldShowLoading = isAuthLoading || isCreating;

  return (
    <LoadingWrapper loading={shouldShowLoading}>
      <></>
    </LoadingWrapper>
  );
}
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { DEFAULT_MODEL } from '../../../business/chat/constants/models';
import { SessionAdapter } from '../../../persistence/shared/adapters/SessionAdapter';
import { useAuth } from '../../auth/context/AuthContext';
import { useRoomCreation } from '../../chat/hooks/useRoomCreation';
import { LoadingWrapper } from '../../components/LoadingWrapper';

export default function NewChatScreen() {
  const { session, isLoading } = useAuth();
  const { createRoom } = useRoomCreation();
  
  const hasAttemptedCreation = useRef(false);

  console.log('💬 [NewChatScreen] Component rendered:', { 
    hasSession: !!session, 
    isLoading, 
    hasAttemptedCreation: hasAttemptedCreation.current,
    timestamp: new Date().toISOString()
  });

  // Handle room creation when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 [NewChatScreen] Focused, checking if we need to create room');
      
      const createNewChat = async () => {
        // Prevent multiple attempts
        if (hasAttemptedCreation.current) {
          console.log('🔍 [NewChatScreen] Already attempted creation, skipping');
          return;
        }

        try {
          // Wait for auth to finish loading
          if (isLoading) {
            console.log('🔍 [NewChatScreen] Auth still loading, waiting...');
            return;
          }

          // Check current session
          if (!session) {
            console.log('🚪 [NewChatScreen] No session, redirecting to auth');
            router.replace('/auth');
            return;
          }

          console.log('🏗️ [NewChatScreen] Creating new chat room for user:', session.user.id);
          hasAttemptedCreation.current = true;

          console.log('🔍 [NewChatScreen] About to create room with model:', DEFAULT_MODEL);
          
          // Create a proper IUserSession using the session adapter
          const sessionAdapter = new SessionAdapter();
          const userSession = sessionAdapter.createSessionFromParams({
            userId: session.user.id,
            accessToken: session.access_token,
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : new Date(),
            userEmail: session.user.email || undefined,
            createdAt: new Date()
          });

          // Use the custom hook for room creation
          const result = await createRoom(DEFAULT_MODEL, userSession);
          
          if (!result.success || !result.room) {
            throw new Error('Failed to create new chat room');
          }
          
          const newRoomId = result.room.id;
          console.log('🔍 [NewChatScreen] Room created with ID:', newRoomId);

          console.log('✅ [NewChatScreen] Successfully created room:', newRoomId);
          console.log('🔍 [NewChatScreen] Navigating to room:', newRoomId, 'at:', new Date().toISOString());
          router.replace(`/chat/${newRoomId}`);
        } catch (error) {
          console.error('❌ [NewChatScreen] Error in createNewChat:', error);
          hasAttemptedCreation.current = false; // Allow manual retry on next focus

          // If we get a 401 or permission error, redirect to auth
          if (error instanceof Error && (
            error.message.includes('401') || 
            error.message.includes('permission denied') ||
            error.message.includes('Unauthorized')
          )) {
            console.log('🚨 [NewChatScreen] Auth error detected, redirecting to auth');
            router.replace('/auth');
          } else {
            // Avoid redirecting to '/' which immediately redirects back to '/chat', causing a loop
            console.log('🔍 [NewChatScreen] Non-auth error creating room. Staying on /chat to avoid redirect loop.');
            // Optionally, you could show a toast or error UI here.
            return;
          }
        }
      };

      // Reset the guard and create room
      hasAttemptedCreation.current = false;
      createNewChat();
    }, [session, isLoading, createRoom])
  );

  // Show loading only when auth is loading or when we're creating a room
  const isCreatingRoom = hasAttemptedCreation.current;
  const shouldShowLoading = isLoading || isCreatingRoom;

  return (
    <LoadingWrapper loading={shouldShowLoading}>
      <></>
    </LoadingWrapper>
  );
}
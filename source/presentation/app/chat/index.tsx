import { LoadingWrapper } from '../../../components/LoadingWrapper';
import { useAuth } from '../../../auth/hooks/useAuth';
import { DEFAULT_MODEL } from '../../../business/chat/constants/models';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { useBusinessContext } from '../../../presentation/shared/BusinessContextProvider';

export default function NewChatScreen() {
  const { session, isLoading } = useAuth();
  const { useCaseFactory } = useBusinessContext();
  
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

          // Use CreateRoomUseCase from business layer
          const createRoomUseCase = useCaseFactory.createCreateRoomUseCase();
          console.log('🔍 [NewChatScreen] About to create room with model:', DEFAULT_MODEL);
          
          // Pass the parameters in the format expected by CreateRoomUseCase
          const result = await createRoomUseCase.execute({
            model: DEFAULT_MODEL,
            session: {
              userId: session.user.id,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: new Date(session.expires_at * 1000),
              user: {
                id: session.user.id,
                email: session.user.email || undefined
              }
            }
          });
          
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
    }, [session, isLoading, useCaseFactory])
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
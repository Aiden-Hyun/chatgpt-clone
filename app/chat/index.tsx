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

        // Generate a unique name for the new chat room
        const generateUniqueName = async (baseName: string): Promise<string> => {
          let counter = 1;
          let name = baseName;
          
          while (true) {
            // Check if this name already exists for this user
            const { data: existingRoom } = await supabase
              .from('chatrooms')
              .select('id')
              .eq('user_id', session.user.id)
              .eq('name', name)
              .single();
            
            if (!existingRoom) {
              return name; // Name is unique, use it
            }
            
            // Name exists, try with counter
            name = `${baseName} ${counter}`;
            counter++;
          }
        };

        const uniqueName = await generateUniqueName('New Chat');

        // Create a new chat room with unique name
        const { data: newRoom, error } = await supabase
          .from('chatrooms')
          .insert({
            user_id: session.user.id,
            name: uniqueName,
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
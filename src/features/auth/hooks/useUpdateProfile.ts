import { useCallback, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';

interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
}

/**
 * Hook for updating user profile information
 * Handles both Supabase auth metadata and profiles table updates
 */
export const useUpdateProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setIsUpdating(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No active session');
      }

      // Update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (profileError) {
        throw profileError;
      }

      // Update auth metadata (for backward compatibility)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: data.display_name,
          name: data.display_name,
        }
      });

      if (authError) {
        throw authError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateProfile,
    isUpdating,
  };
}; 
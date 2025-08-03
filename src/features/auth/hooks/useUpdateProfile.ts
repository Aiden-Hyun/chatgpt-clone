import { useCallback, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';

interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
}

interface UpdateProfileOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for updating user profile information
 * Handles both Supabase auth metadata and profiles table updates
 */
export const useUpdateProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(async (data: UpdateProfileData, options?: UpdateProfileOptions) => {
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

      // Call success callback if provided
      options?.onSuccess?.();

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Call error callback if provided
      options?.onError?.(error);
      
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
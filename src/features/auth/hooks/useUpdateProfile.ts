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
      console.log('🔄 Starting profile update with data:', data);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No active session');
      }
      console.log('👤 User session found:', session.user.id);

      // Update the profiles table
      console.log('📝 Updating profiles table...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        throw profileError;
      }
      console.log('✅ Profiles table updated successfully');

      // Update auth metadata (for backward compatibility)
      console.log('🔐 Updating auth metadata...');
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: data.display_name,
          name: data.display_name,
        }
      });

      if (authError) {
        console.error('❌ Auth update error:', authError);
        throw authError;
      }
      console.log('✅ Auth metadata updated successfully');

      console.log('🎉 Profile update completed successfully');
      // Call success callback if provided
      options?.onSuccess?.();

      return { success: true };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      
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
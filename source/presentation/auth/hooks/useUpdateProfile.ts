import { useCallback } from 'react';

import { useUserProfileViewModel } from '../../../business/auth/view-models/useUserProfileViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';
import { useAuth } from '../context/AuthContext';

interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
}

/**
 * Hook for updating user profile information
 * Uses business layer UseCases instead of direct database access
 */
export const useUpdateProfile = () => {
  const { session } = useAuth();
  
  const useCaseFactory = useUseCaseFactory();
  const userProfileViewModel = useUserProfileViewModel(
    useCaseFactory.createGetUserProfileUseCase(),
    useCaseFactory.createUpdateUserProfileUseCase()
  );

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      if (!session?.user) {
        throw new Error('No active session');
      }

      const result = await userProfileViewModel.updateUserProfile({
        userId: session.user.id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url
      });

      if (result.success) {
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      throw error;
    }
  }, [session, userProfileViewModel]);

  return {
    updateProfile,
    isUpdating: userProfileViewModel.isLoading,
  };
}; 
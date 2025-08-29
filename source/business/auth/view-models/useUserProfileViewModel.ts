import { useState, useCallback } from 'react';
import { GetUserProfileUseCase } from '../use-cases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../use-cases/UpdateUserProfileUseCase';
import { GetUserProfileParams, UpdateUserProfileParams, UserProfile } from '../../interfaces';

export function useUserProfileViewModel(
  getUserProfileUseCase: GetUserProfileUseCase,
  updateUserProfileUseCase: UpdateUserProfileUseCase
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const getUserProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserProfileUseCase.execute({ userId });
      
      if (result.success && result.profile) {
        setProfile(result.profile);
        return { success: true, profile: result.profile };
      } else {
        setError(result.error || 'Failed to get user profile');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getUserProfileUseCase]);

  const updateUserProfile = useCallback(async (params: UpdateUserProfileParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateUserProfileUseCase.execute(params);
      
      if (result.success && result.profile) {
        setProfile(result.profile);
        return { success: true, profile: result.profile };
      } else {
        setError(result.error || 'Failed to update user profile');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [updateUserProfileUseCase]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    getUserProfile,
    updateUserProfile,
    clearError
  };
}

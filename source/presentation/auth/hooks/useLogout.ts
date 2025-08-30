import { router } from 'expo-router';
import { useCallback } from 'react';

import { useSignOutViewModel } from '../../../business/auth/view-models/useSignOutViewModel';
import { useStorageViewModel } from '../../../business/session/view-models/useStorageViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

/**
 * Hook for handling user logout functionality
 * Centralizes logout logic and provides loading state
 */
export const useLogout = () => {
  const useCaseFactory = useUseCaseFactory();
  const signOutViewModel = useSignOutViewModel(useCaseFactory.createSignOutUseCase());
  const storageViewModel = useStorageViewModel(
    useCaseFactory.createClearStorageUseCase(),
    useCaseFactory.createGetStoredRouteUseCase(),
    useCaseFactory.createSetStoredRouteUseCase()
  );

  const logout = useCallback(async () => {
    try {
      // Clear storage first
      await storageViewModel.clearStorage('all');
      
      // Then sign out
      await signOutViewModel.signOut();
      
      // Navigate to login screen
      router.replace('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, try to navigate to login
      router.replace('/auth');
    }
  }, [signOutViewModel, storageViewModel]);

  return {
    logout,
    isLoggingOut: signOutViewModel.isLoading || storageViewModel.isLoading,
  };
}; 
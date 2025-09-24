import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { useBusinessContext } from '../../../../shared/BusinessContextProvider';

/**
 * Hook for managing settings navigation
 * Uses business layer for navigation tracking
 */
export const useSettingsNavigation = () => {
  const { useCaseFactory } = useBusinessContext();

  // Get navigation use case
  const navigationUseCase = useMemo(() => 
    useCaseFactory.createGetPreviousRouteUseCase(),
    [useCaseFactory]
  );

  const handleBack = useCallback(() => {
    try {
      const { previousRoute, clearRoute } = navigationUseCase.execute();
      
      if (previousRoute) {
        router.replace(previousRoute);
        clearRoute();
      } else {
        // Fallback to chat page if no previous route
        router.replace('/chat');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to chat page if anything goes wrong
      router.replace('/chat');
    }
  }, [navigationUseCase]);

  const handleLogout = useCallback(async (logout: () => Promise<void>) => {
    await logout();
    router.replace('/auth');
  }, []);

  const navigateToThemes = useCallback(() => {
    // Don't overwrite the original previous route - just navigate to themes
    // The themes page will handle going back to settings
    router.push('/settings/themes');
  }, []);

  return {
    handleBack,
    handleLogout,
    navigateToThemes,
  };
};
import { useCallback } from 'react';

export interface UseRouteNavigationOptions {
  navigateTo: (route: string, replace?: boolean) => Promise<void>;
  isNavigating: boolean;
}

/**
 * Hook for specific route navigation
 * Provides navigation methods for specific routes in the app
 */
export const useRouteNavigation = (options: UseRouteNavigationOptions) => {
  const { navigateTo, isNavigating } = options;

  // Navigation to home
  const navigateToHome = useCallback(async () => {
    if (isNavigating) return;
    await navigateTo('/(tabs)/(home)', true);
  }, [navigateTo, isNavigating]);

  // Navigation to login
  const navigateToLogin = useCallback(async () => {
    if (isNavigating) return;
    await navigateTo('/(auth)/login', true);
  }, [navigateTo, isNavigating]);

  // Navigation to chat room
  const navigateToChat = useCallback(async (roomId: string) => {
    if (isNavigating) return;
    await navigateTo(`/(tabs)/(chat)/${roomId}`);
  }, [navigateTo, isNavigating]);

  // Navigation to explore
  const navigateToExplore = useCallback(async () => {
    if (isNavigating) return;
    await navigateTo('/(tabs)/(explore)');
  }, [navigateTo, isNavigating]);

  return {
    navigateToHome,
    navigateToLogin,
    navigateToChat,
    navigateToExplore,
  };
}; 
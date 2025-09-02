import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { navigationTracker } from '../../../src/shared/lib/navigationTracker';

export const useSettingsNavigation = () => {
  // Track the previous route for better navigation
  const previousRouteRef = useRef<string | null>(null);

  // Track navigation changes to determine where to go back to
  useEffect(() => {
    // When the settings page mounts, try to determine where we came from
    if (previousRouteRef.current === null) {
      // Check if we can go back in the navigation stack
      const canGoBack = (router as any).canGoBack?.() ?? false;
      
      if (canGoBack) {
        // If we can go back, we'll use router.back() later
        // But we should still have a fallback in case it fails
        previousRouteRef.current = '/chat';
      } else {
        // If we can't go back, we need a fallback
        // In a drawer navigation, users typically come from a chat room
        previousRouteRef.current = '/chat';
      }
    }
  }, []);

  const handleBack = () => {
    try {
      // Always use the tracked route instead of router.back() for more reliable navigation
      const previousRoute = navigationTracker.getPreviousRoute();
      
      if (previousRoute) {
        router.replace(previousRoute);
      } else {
        // Only fallback to /chat if we have no tracked route
        router.replace('/chat');
      }
      
      // Clear the tracked route after using it
      navigationTracker.clearPreviousRoute();
    } catch (error) {
      // Fallback to chat page if anything goes wrong
      router.replace('/chat');
    }
  };

  const handleLogout = async (logout: () => Promise<void>) => {
    await logout();
    router.replace('/auth');
  };

  const navigateToThemes = () => {
    // Don't overwrite the original previous route - just navigate to themes
    // The themes page will handle going back to settings
    router.push('/settings/themes');
  };

  return {
    handleBack,
    handleLogout,
    navigateToThemes,
  };
};

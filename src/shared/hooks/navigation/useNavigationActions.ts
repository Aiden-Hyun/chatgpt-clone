import { router } from 'expo-router';
import { useCallback } from 'react';

export interface UseNavigationActionsOptions {
  preventNavigationDuringLoading?: boolean;
  isNavigating: boolean;
  canGoBack: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
}

/**
 * Hook for generic navigation actions with guards and error handling
 * Provides navigateTo, goBack, and navigation guards
 */
export const useNavigationActions = (options: UseNavigationActionsOptions) => {
  const { 
    preventNavigationDuringLoading = true,
    isNavigating,
    canGoBack,
    setIsNavigating
  } = options;

  // Generic navigation with error handling
  const navigateTo = useCallback(async (route: string, replace: boolean = false) => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      if (replace) {
        await router.replace(route);
      } else {
        await router.push(route);
      }
    } catch (error) {
      console.error('Navigation error - navigateTo:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating, setIsNavigating]);

  // Go back navigation
  const goBack = useCallback(async () => {
    if (isNavigating || !canGoBack) return;
    
    try {
      setIsNavigating(true);
      await router.back();
    } catch (error) {
      console.error('Navigation error - goBack:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating, canGoBack, setIsNavigating]);

  // Navigation guards
  const canNavigate = useCallback((loadingState?: boolean) => {
    if (isNavigating) return false;
    if (preventNavigationDuringLoading && loadingState) return false;
    return true;
  }, [isNavigating, preventNavigationDuringLoading]);

  return {
    navigateTo,
    goBack,
    canNavigate,
  };
}; 
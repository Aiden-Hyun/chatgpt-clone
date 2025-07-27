import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export interface NavigationState {
  currentRoute: string;
  canGoBack: boolean;
  isNavigating: boolean;
}

export interface UseNavigationOptions {
  preventNavigationDuringLoading?: boolean;
}

export const useNavigation = (options: UseNavigationOptions = {}) => {
  const { preventNavigationDuringLoading = true } = options;
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Track current route and navigation history
  useEffect(() => {
    setNavigationHistory(prev => {
      if (prev[prev.length - 1] !== pathname) {
        return [...prev, pathname];
      }
      return prev;
    });
  }, [pathname]);

  const currentRoute = pathname;
  const canGoBack = navigationHistory.length > 1;

  // Navigation methods
  const navigateToHome = useCallback(async () => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      await router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Navigation error - navigateToHome:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating]);

  const navigateToLogin = useCallback(async () => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      await router.replace('/(auth)/login');
    } catch (error) {
      console.error('Navigation error - navigateToLogin:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating]);

  const navigateToChat = useCallback(async (roomId: string) => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      await router.push(`/(tabs)/(chat)/${roomId}`);
    } catch (error) {
      console.error('Navigation error - navigateToChat:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating]);

  const navigateToExplore = useCallback(async () => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      await router.push('/(tabs)/(explore)');
    } catch (error) {
      console.error('Navigation error - navigateToExplore:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [isNavigating]);

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
  }, [isNavigating, canGoBack]);

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
  }, [isNavigating]);

  // Navigation guards
  const canNavigate = useCallback((loadingState?: boolean) => {
    if (isNavigating) return false;
    if (preventNavigationDuringLoading && loadingState) return false;
    return true;
  }, [isNavigating, preventNavigationDuringLoading]);

  return {
    // State
    currentRoute,
    canGoBack,
    isNavigating,
    navigationHistory,
    
    // Navigation methods
    navigateToHome,
    navigateToLogin,
    navigateToChat,
    navigateToExplore,
    goBack,
    navigateTo,
    
    // Utilities
    canNavigate,
  };
}; 
import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';

export interface NavigationState {
  currentRoute: string;
  canGoBack: boolean;
  isNavigating: boolean;
}

/**
 * Hook for managing navigation state and route tracking
 * Provides current route, navigation history, and back navigation state
 */
export const useNavigationState = () => {
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

  return {
    // State
    currentRoute,
    canGoBack,
    isNavigating,
    navigationHistory,
    
    // State setters
    setIsNavigating,
  };
}; 
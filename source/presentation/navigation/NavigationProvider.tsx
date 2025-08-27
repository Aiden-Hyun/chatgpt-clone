import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AppRoute, NavigationState, ParamsOf } from '../../business/navigation';
import { useBusinessContext } from '../shared/BusinessContextProvider';

/**
 * Navigation context type
 */
interface NavigationContextType {
  // Navigation state
  navigationState: NavigationState;
  
  // Navigation methods
  navigate: <T extends AppRoute>(route: T, params?: ParamsOf<T>) => void;
  replace: <T extends AppRoute>(route: T, params?: ParamsOf<T>) => void;
  goBack: () => void;
  reset: <T extends AppRoute>(route: T, params?: ParamsOf<T>) => void;
  
  // Convenience navigation methods
  navigateToRoom: (roomId: string) => void;
  navigateToHome: () => void;
  navigateToNewChat: () => void;
  
  // Navigation state helpers
  isCurrentRoute: (route: AppRoute | string) => boolean;
  getPreviousRoute: () => string | null;
  getHistory: () => readonly string[];
}

// Create the context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * Navigation provider props
 */
interface NavigationProviderProps {
  children: ReactNode;
}

/**
 * Provider component for navigation context
 */
export function NavigationProvider({ children }: NavigationProviderProps) {
  const { navigationService } = useBusinessContext();
  const [navigationState, setNavigationState] = useState<NavigationState>(
    navigationService.getNavigationState()
  );
  
  // Update navigation state when it changes in the service
  useEffect(() => {
    // This would be better with an event system, but for now we'll poll
    const interval = setInterval(() => {
      const newState = navigationService.getNavigationState();
      if (newState.getCurrentRoute() !== navigationState.getCurrentRoute()) {
        setNavigationState(newState);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [navigationService, navigationState]);
  
  // Navigation methods
  const navigate = useCallback(<T extends AppRoute>(route: T, params?: ParamsOf<T>) => {
    navigationService.navigate(route, params);
  }, [navigationService]);
  
  const replace = useCallback(<T extends AppRoute>(route: T, params?: ParamsOf<T>) => {
    navigationService.replace(route, params);
  }, [navigationService]);
  
  const goBack = useCallback(() => {
    navigationService.goBack();
  }, [navigationService]);
  
  const reset = useCallback(<T extends AppRoute>(route: T, params?: ParamsOf<T>) => {
    navigationService.reset(route, params);
  }, [navigationService]);
  
  // Convenience navigation methods
  const navigateToRoom = useCallback((roomId: string) => {
    navigationService.navigateToRoom(roomId);
  }, [navigationService]);
  
  const navigateToHome = useCallback(() => {
    navigationService.navigateToHome();
  }, [navigationService]);
  
  const navigateToNewChat = useCallback(() => {
    navigationService.navigateToNewChat();
  }, [navigationService]);
  
  // Navigation state helpers
  const isCurrentRoute = useCallback((route: AppRoute | string) => {
    return navigationState.isCurrentRoute(route);
  }, [navigationState]);
  
  const getPreviousRoute = useCallback(() => {
    return navigationState.getPreviousRoute();
  }, [navigationState]);
  
  const getHistory = useCallback(() => {
    return navigationState.getHistory();
  }, [navigationState]);
  
  // Create the context value
  const contextValue = React.useMemo(() => ({
    navigationState,
    navigate,
    replace,
    goBack,
    reset,
    navigateToRoom,
    navigateToHome,
    navigateToNewChat,
    isCurrentRoute,
    getPreviousRoute,
    getHistory,
  }), [
    navigationState,
    navigate,
    replace,
    goBack,
    reset,
    navigateToRoom,
    navigateToHome,
    navigateToNewChat,
    isCurrentRoute,
    getPreviousRoute,
    getHistory,
  ]);
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Hook to use the navigation context
 */
export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
}

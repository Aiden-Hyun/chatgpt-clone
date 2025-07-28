import { useNavigationActions } from './useNavigationActions';
import { useNavigationState } from './useNavigationState';
import { useRouteNavigation } from './useRouteNavigation';

export interface UseNavigationCombinedOptions {
  preventNavigationDuringLoading?: boolean;
}

/**
 * Combined navigation hook that provides backward compatibility
 * Combines all navigation functionality into a single interface
 */
export const useNavigationCombined = (options: UseNavigationCombinedOptions = {}) => {
  const { preventNavigationDuringLoading = true } = options;

  // Core navigation state
  const navigationState = useNavigationState();
  const { currentRoute, canGoBack, isNavigating, navigationHistory, setIsNavigating } = navigationState;

  // Navigation actions
  const navigationActions = useNavigationActions({
    preventNavigationDuringLoading,
    isNavigating,
    canGoBack,
    setIsNavigating,
  });
  const { navigateTo, goBack, canNavigate } = navigationActions;

  // Route-specific navigation
  const routeNavigation = useRouteNavigation({
    navigateTo,
    isNavigating,
  });
  const { navigateToHome, navigateToLogin, navigateToChat, navigateToExplore } = routeNavigation;

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
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useStorageViewModel } from '../../../business/session/view-models/useStorageViewModel';
import { Logger } from '../../../service/shared/utils/Logger';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export interface AuthNavigationOptions {
  preserveRoute?: boolean;
  clearHistory?: boolean;
  redirectPath?: string;
}

export interface AuthNavigationHook {
  navigateToProtectedRoute: (route: string, options?: AuthNavigationOptions) => Promise<void>;
  navigateToAuth: (options?: AuthNavigationOptions) => Promise<void>;
  handleAuthSuccess: (options?: AuthNavigationOptions) => Promise<void>;
  navigateToSignUp: () => void;
  navigateToForgotPassword: () => void;
  navigateBack: () => void;
  getCurrentRoute: () => string | null;
  getPreviousRoute: () => Promise<string | null>;
  setPreviousRoute: (route: string) => Promise<void>;
}

// Storage key for preserving the intended route
const INTENDED_ROUTE_KEY = 'auth_intended_route';
const PREVIOUS_ROUTE_KEY = 'auth_previous_route';

export function useAuthNavigation(): AuthNavigationHook {
  const router = useRouter();
  
  const useCaseFactory = useUseCaseFactory();
  const storageViewModel = useStorageViewModel(
    useCaseFactory.createClearStorageUseCase(),
    useCaseFactory.createGetStoredRouteUseCase(),
    useCaseFactory.createSetStoredRouteUseCase()
  );

  /**
   * Navigate to a protected route, handling authentication if needed
   */
  const navigateToProtectedRoute = useCallback(async (
    route: string, 
    options: AuthNavigationOptions = {}
  ) => {
    try {
      Logger.info('useAuthNavigation: Navigating to protected route', { route, options });

      if (options.preserveRoute) {
        // Store the intended route for after authentication
        await storageViewModel.setStoredRoute(INTENDED_ROUTE_KEY, route);
      }

      if (options.clearHistory) {
        router.replace(route);
      } else {
        router.push(route);
      }
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to navigate to protected route', { 
        route, 
        error 
      });
    }
  }, [router, storageViewModel]);

  /**
   * Navigate to authentication screen
   */
  const navigateToAuth = useCallback(async (options: AuthNavigationOptions = {}) => {
    try {
      Logger.info('useAuthNavigation: Navigating to auth screen', { options });

      if (options.preserveRoute && options.redirectPath) {
        // Store the current route to return to after auth
        await storageViewModel.setStoredRoute(INTENDED_ROUTE_KEY, options.redirectPath);
      }

      if (options.clearHistory) {
        router.replace('/auth');
      } else {
        router.push('/auth');
      }
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to navigate to auth', { error });
    }
  }, [router, storageViewModel]);

  /**
   * Handle successful authentication - redirect to intended route or default
   */
  const handleAuthSuccess = useCallback(async (options: AuthNavigationOptions = {}) => {
    try {
      Logger.info('useAuthNavigation: Handling auth success', { options });

      let targetRoute = '/chat'; // Default route after auth

      // Check for stored intended route
      const result = await storageViewModel.getStoredRoute(INTENDED_ROUTE_KEY);
      if (result.success && result.route) {
        targetRoute = result.route;
        // Clear the stored route after using it
        await storageViewModel.setStoredRoute(INTENDED_ROUTE_KEY, '');
        Logger.info('useAuthNavigation: Redirecting to intended route', { 
          intendedRoute: targetRoute 
        });
      }

      // Use provided redirect path if available
      if (options.redirectPath) {
        targetRoute = options.redirectPath;
      }

      // Always replace to prevent going back to auth screen
      router.replace(targetRoute);
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to handle auth success', { error });
      // Fallback to default route
      router.replace('/chat');
    }
  }, [router, storageViewModel]);

  /**
   * Navigate to sign up screen
   */
  const navigateToSignUp = useCallback(() => {
    try {
      Logger.info('useAuthNavigation: Navigating to sign up');
      router.push('/signup');
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to navigate to sign up', { error });
    }
  }, [router]);

  /**
   * Navigate to forgot password screen
   */
  const navigateToForgotPassword = useCallback(() => {
    try {
      Logger.info('useAuthNavigation: Navigating to forgot password');
      router.push('/forgot-password');
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to navigate to forgot password', { error });
    }
  }, [router]);

  /**
   * Navigate back to previous screen
   */
  const navigateBack = useCallback(() => {
    try {
      Logger.info('useAuthNavigation: Navigating back');
      
      if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback to a safe route if can't go back
        router.replace('/chat');
      }
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to navigate back', { error });
      router.replace('/chat');
    }
  }, [router]);

  /**
   * Get current route path
   */
  const getCurrentRoute = useCallback((): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return window.location.pathname;
      }
      return null;
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to get current route', { error });
      return null;
    }
  }, []);

  /**
   * Get previously stored route
   */
  const getPreviousRoute = useCallback(async (): Promise<string | null> => {
    try {
      const result = await storageViewModel.getStoredRoute(PREVIOUS_ROUTE_KEY);
      return result.success ? result.route : null;
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to get previous route', { error });
      return null;
    }
  }, [storageViewModel]);

  /**
   * Store the previous route for later navigation
   */
  const setPreviousRoute = useCallback(async (route: string) => {
    try {
      Logger.info('useAuthNavigation: Setting previous route', { route });
      await storageViewModel.setStoredRoute(PREVIOUS_ROUTE_KEY, route);
    } catch (error) {
      Logger.error('useAuthNavigation: Failed to set previous route', { route, error });
    }
  }, [storageViewModel]);

  return {
    navigateToProtectedRoute,
    navigateToAuth,
    handleAuthSuccess,
    navigateToSignUp,
    navigateToForgotPassword,
    navigateBack,
    getCurrentRoute,
    getPreviousRoute,
    setPreviousRoute
  };
}

/**
 * Utility function to check if a route requires authentication
 */
export function isProtectedRoute(route: string): boolean {
  const protectedRoutes = [
    '/chat',
    '/settings',
    '/profile'
  ];

  const publicRoutes = [
    '/auth',
    '/signup',
    '/forgot-password',
    '/'
  ];

  // Check if it's explicitly public
  if (publicRoutes.includes(route)) {
    return false;
  }

  // Check if it's explicitly protected
  if (protectedRoutes.some(protectedRoute => route.startsWith(protectedRoute))) {
    return true;
  }

  // Default to protected for unknown routes
  return true;
}

/**
 * Utility function to get the appropriate redirect route after authentication
 */
export function getPostAuthRoute(intendedRoute?: string): string {
  if (intendedRoute && isProtectedRoute(intendedRoute)) {
    return intendedRoute;
  }

  return '/chat'; // Default route
}

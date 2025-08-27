import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { UserSession } from '../../../business/session/entities/UserSession';
import { RoutePermissionChecker } from '../../../service/auth/utils/RoutePermissionChecker';
import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

export interface ProtectedRouteState {
  isAuthorized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: UserSession | null;
  error: string | null;
  redirectTo: string | null;
  authorizationDetails: {
    hasValidSession: boolean;
    sessionExpired: boolean;
    hasRequiredPermissions: boolean;
    userPermissions: string[];
    requiredPermissions: string[];
    missingPermissions: string[];
  };
}

export interface ProtectedRouteActions {
  redirectToLogin: (returnUrl?: string) => void;
  redirectToUnauthorized: () => void;
  checkAuthorization: (route?: string, permissions?: string[]) => Promise<boolean>;
  refreshAuthorization: () => Promise<void>;
  clearError: () => void;
}

export interface UseProtectedRouteOptions {
  route?: string;
  requiredPermissions?: string[];
  requireAuthentication?: boolean;
  autoRedirect?: boolean;
  onUnauthorized?: (reason: string) => void;
  onAuthenticationRequired?: () => void;
}

export interface UseProtectedRouteHook extends ProtectedRouteState, ProtectedRouteActions {}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}): UseProtectedRouteHook {
  const {
    route: providedRoute,
    requiredPermissions,
    requireAuthentication = true,
    autoRedirect = true,
    onUnauthorized,
    onAuthenticationRequired
  } = options;

  const [state, setState] = useState<ProtectedRouteState>({
    isAuthorized: false,
    isLoading: true,
    isAuthenticated: false,
    session: null,
    error: null,
    redirectTo: null,
    authorizationDetails: {
      hasValidSession: false,
      sessionExpired: false,
      hasRequiredPermissions: false,
      userPermissions: [],
      requiredPermissions: requiredPermissions || [],
      missingPermissions: []
    }
  });

  const { useCaseFactory } = useBusinessContext();
  const router = useRouter();
  const pathname = usePathname();
  
  // Use provided route or current pathname
  const currentRoute = providedRoute || pathname;

  /**
   * Check authorization for the current route
   */
  const checkAuthorization = useCallback(async (
    route?: string, 
    permissions?: string[]
  ): Promise<boolean> => {
    try {
      const targetRoute = route || currentRoute;
      const targetPermissions = permissions || requiredPermissions;

      Logger.info('useProtectedRoute: Checking authorization', { 
        route: targetRoute,
        permissions: targetPermissions 
      });

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const checkAuthUseCase = useCaseFactory.createCheckAuthorizationUseCase();
      const result = await checkAuthUseCase.execute({
        route: targetRoute,
        requiredPermissions: targetPermissions,
        requireAuthentication
      });

      if (!result.success) {
        Logger.error('useProtectedRoute: Authorization check failed', { 
          error: result.error 
        });
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthorized: false,
          isAuthenticated: false,
          error: result.error || 'Authorization check failed',
          authorizationDetails: result.authorizationDetails
        }));
        
        return false;
      }

      // Update state with authorization result
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthorized: result.isAuthorized,
        isAuthenticated: result.isAuthenticated,
        session: result.session || null,
        error: result.error || null,
        redirectTo: result.redirectTo || null,
        authorizationDetails: {
          ...result.authorizationDetails,
          missingPermissions: result.missingPermissions || []
        }
      }));

      // Handle unauthorized access
      if (!result.isAuthorized) {
        Logger.warn('useProtectedRoute: Access denied', { 
          route: targetRoute,
          reason: result.error,
          isAuthenticated: result.isAuthenticated 
        });

        if (autoRedirect) {
          if (!result.isAuthenticated) {
            // User needs to authenticate
            if (onAuthenticationRequired) {
              onAuthenticationRequired();
            } else {
              redirectToLogin(targetRoute);
            }
          } else {
            // User is authenticated but lacks permissions
            if (onUnauthorized) {
              onUnauthorized(result.error || 'Access denied');
            } else {
              redirectToUnauthorized();
            }
          }
        }

        return false;
      }

      Logger.info('useProtectedRoute: Authorization successful', { 
        route: targetRoute,
        userId: result.session?.userId 
      });

      return true;
    } catch (error) {
      Logger.error('useProtectedRoute: Authorization check error', { error });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthorized: false,
        isAuthenticated: false,
        error: 'Authorization check failed'
      }));
      
      return false;
    }
  }, [
    currentRoute, 
    requiredPermissions, 
    requireAuthentication, 
    autoRedirect, 
    onUnauthorized, 
    onAuthenticationRequired,
    useCaseFactory
  ]);

  /**
   * Redirect to login page
   */
  const redirectToLogin = useCallback((returnUrl?: string) => {
    Logger.info('useProtectedRoute: Redirecting to login', { returnUrl });
    
    const loginUrl = '/auth';
    const targetUrl = returnUrl ? `${loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}` : loginUrl;
    
    router.replace(targetUrl);
  }, [router]);

  /**
   * Redirect to unauthorized page
   */
  const redirectToUnauthorized = useCallback(() => {
    Logger.info('useProtectedRoute: Redirecting to unauthorized page');
    router.replace('/unauthorized');
  }, [router]);

  /**
   * Refresh authorization status
   */
  const refreshAuthorization = useCallback(async (): Promise<void> => {
    await checkAuthorization();
  }, [checkAuthorization]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Initial authorization check when route or permissions change
   */
  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]);

  /**
   * Re-check authorization when route changes
   */
  useEffect(() => {
    if (currentRoute) {
      checkAuthorization();
    }
  }, [currentRoute, checkAuthorization]);

  return {
    // State
    isAuthorized: state.isAuthorized,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    session: state.session,
    error: state.error,
    redirectTo: state.redirectTo,
    authorizationDetails: state.authorizationDetails,

    // Actions
    redirectToLogin,
    redirectToUnauthorized,
    checkAuthorization,
    refreshAuthorization,
    clearError
  };
}

/**
 * Hook for checking specific permissions
 */
export function usePermissions() {
  const { useCaseFactory } = useBusinessContext();

  const checkPermission = useCallback(async (permission: string): Promise<boolean> => {
    try {
      const checkAuthUseCase = useCaseFactory.createCheckAuthorizationUseCase();
      return await checkAuthUseCase.hasPermission(permission);
    } catch (error) {
      Logger.error('usePermissions: Permission check failed', { error, permission });
      return false;
    }
  }, [useCaseFactory]);

  const checkAnyPermission = useCallback(async (permissions: string[]): Promise<boolean> => {
    try {
      const checkAuthUseCase = useCaseFactory.createCheckAuthorizationUseCase();
      return await checkAuthUseCase.hasAnyPermission(permissions);
    } catch (error) {
      Logger.error('usePermissions: Any permission check failed', { error, permissions });
      return false;
    }
  }, [useCaseFactory]);

  const checkAllPermissions = useCallback(async (permissions: string[]): Promise<boolean> => {
    try {
      const checkAuthUseCase = useCaseFactory.createCheckAuthorizationUseCase();
      return await checkAuthUseCase.hasAllPermissions(permissions);
    } catch (error) {
      Logger.error('usePermissions: All permissions check failed', { error, permissions });
      return false;
    }
  }, [useCaseFactory]);

  const getUserPermissions = useCallback(async (): Promise<string[]> => {
    try {
      const checkAuthUseCase = useCaseFactory.createCheckAuthorizationUseCase();
      return await checkAuthUseCase.getUserPermissions();
    } catch (error) {
      Logger.error('usePermissions: Get user permissions failed', { error });
      return [];
    }
  }, [useCaseFactory]);

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    getUserPermissions
  };
}

/**
 * Hook for route-specific utilities
 */
export function useRouteUtils() {
  const isPublicRoute = useCallback((route: string): boolean => {
    return RoutePermissionChecker.isPublicRoute(route);
  }, []);

  const requiresAuthentication = useCallback((route: string): boolean => {
    return RoutePermissionChecker.requiresAuthentication(route);
  }, []);

  const getRequiredPermissions = useCallback((route: string): string[] => {
    return RoutePermissionChecker.getRequiredPermissions(route);
  }, []);

  const getMinimumPermissionLevel = useCallback((route: string): string | null => {
    return RoutePermissionChecker.getMinimumPermissionLevel(route);
  }, []);

  return {
    isPublicRoute,
    requiresAuthentication,
    getRequiredPermissions,
    getMinimumPermissionLevel
  };
}

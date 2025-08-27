import { usePathname, useRouter, useSearchParams } from 'expo-router';
import React, { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RoutePermissionChecker } from '../../../service/auth/utils/RoutePermissionChecker';
import { Logger } from '../../../service/shared/utils/Logger';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

export interface AuthRedirectProps {
  children?: ReactNode;
  defaultAuthenticatedRoute?: string;
  defaultUnauthenticatedRoute?: string;
  preserveReturnUrl?: boolean;
  loadingComponent?: ReactNode;
  onRedirect?: (from: string, to: string, reason: string) => void;
}

/**
 * AuthRedirect - Component that handles authentication-based redirects
 * 
 * This component:
 * - Redirects authenticated users away from auth pages
 * - Preserves intended destinations via returnUrl
 * - Handles deep links appropriately
 * - Manages loading states during redirect decisions
 */
export function AuthRedirect({
  children,
  defaultAuthenticatedRoute = '/chat',
  defaultUnauthenticatedRoute = '/auth',
  preserveReturnUrl = true,
  loadingComponent,
  onRedirect
}: AuthRedirectProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectReason, setRedirectReason] = useState<string>('');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    isAuthenticated,
    isLoading: authLoading,
    session
  } = useProtectedRoute({
    requireAuthentication: false,
    autoRedirect: false
  });

  /**
   * Get return URL from search params or storage
   */
  const getReturnUrl = (): string | null => {
    if (!preserveReturnUrl) return null;

    // Check URL parameters first
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      try {
        const decodedUrl = decodeURIComponent(returnUrl);
        // Validate that it's a safe internal URL
        if (decodedUrl.startsWith('/') && !decodedUrl.startsWith('//')) {
          return decodedUrl;
        }
      } catch (error) {
        Logger.warn('AuthRedirect: Invalid returnUrl parameter', { returnUrl, error });
      }
    }

    // Check stored intended destination
    try {
      const stored = localStorage?.getItem('intendedDestination');
      if (stored) {
        localStorage.removeItem('intendedDestination');
        return stored;
      }
    } catch (error) {
      // localStorage might not be available
    }

    return null;
  };

  /**
   * Store intended destination for later redirect
   */
  const storeIntendedDestination = (destination: string) => {
    if (!preserveReturnUrl) return;

    try {
      localStorage?.setItem('intendedDestination', destination);
    } catch (error) {
      // localStorage might not be available
    }
  };

  /**
   * Perform redirect with logging and callbacks
   */
  const performRedirect = (to: string, reason: string) => {
    Logger.info('AuthRedirect: Performing redirect', { 
      from: pathname, 
      to, 
      reason,
      isAuthenticated 
    });

    setIsRedirecting(true);
    setRedirectReason(reason);

    if (onRedirect) {
      onRedirect(pathname, to, reason);
    }

    // Use replace to avoid adding to history stack
    router.replace(to);
  };

  /**
   * Handle redirect logic
   */
  useEffect(() => {
    // Don't redirect while auth is loading
    if (authLoading || isRedirecting) {
      return;
    }

    const currentRoute = pathname;
    const isCurrentRoutePublic = RoutePermissionChecker.isPublicRoute(currentRoute);
    const isAuthRoute = currentRoute.startsWith('/auth');

    Logger.debug('AuthRedirect: Evaluating redirect conditions', {
      currentRoute,
      isAuthenticated,
      isCurrentRoutePublic,
      isAuthRoute,
      userId: session?.userId
    });

    // Case 1: Authenticated user on auth pages
    if (isAuthenticated && isAuthRoute) {
      const returnUrl = getReturnUrl();
      const destination = returnUrl || defaultAuthenticatedRoute;
      
      // Validate destination is accessible
      if (returnUrl && !RoutePermissionChecker.isPublicRoute(returnUrl)) {
        // Check if user can access the return URL
        // For now, just redirect to default if it requires special permissions
        const requiredPermissions = RoutePermissionChecker.getRequiredPermissions(returnUrl);
        const userPermissions = session?.permissions || [];
        
        const canAccess = requiredPermissions.length === 0 || 
                         requiredPermissions.some(perm => 
                           userPermissions.includes(perm) || userPermissions.includes('admin')
                         );
        
        if (canAccess) {
          performRedirect(destination, 'Authenticated user redirected to intended destination');
        } else {
          performRedirect(defaultAuthenticatedRoute, 'Authenticated user redirected to default route (insufficient permissions for return URL)');
        }
      } else {
        performRedirect(destination, 'Authenticated user redirected from auth page');
      }
      return;
    }

    // Case 2: Unauthenticated user on protected pages
    if (!isAuthenticated && !isCurrentRoutePublic) {
      // Store current route as intended destination
      storeIntendedDestination(currentRoute);
      
      const authUrl = preserveReturnUrl 
        ? `${defaultUnauthenticatedRoute}?returnUrl=${encodeURIComponent(currentRoute)}`
        : defaultUnauthenticatedRoute;
      
      performRedirect(authUrl, 'Unauthenticated user redirected to auth');
      return;
    }

    // Case 3: Handle deep links and special routes
    if (currentRoute === '/' && isAuthenticated) {
      // Redirect authenticated users from root to default route
      performRedirect(defaultAuthenticatedRoute, 'Authenticated user redirected from root');
      return;
    }

    if (currentRoute === '/' && !isAuthenticated) {
      // Redirect unauthenticated users from root to auth
      performRedirect(defaultUnauthenticatedRoute, 'Unauthenticated user redirected from root');
      return;
    }

    // No redirect needed
    Logger.debug('AuthRedirect: No redirect needed', { 
      currentRoute, 
      isAuthenticated, 
      isCurrentRoutePublic 
    });

  }, [
    authLoading,
    isAuthenticated,
    pathname,
    session,
    defaultAuthenticatedRoute,
    defaultUnauthenticatedRoute,
    preserveReturnUrl,
    isRedirecting
  ]);

  // Show loading state while determining redirect
  if (authLoading || isRedirecting) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {isRedirecting ? `Redirecting... ${redirectReason}` : 'Checking authentication...'}
        </Text>
      </View>
    );
  }

  // Render children if no redirect is needed
  return <>{children}</>;
}

/**
 * Hook for managing auth redirects programmatically
 */
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  const redirectToAuth = (returnUrl?: string) => {
    const authUrl = returnUrl 
      ? `/auth?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/auth';
    
    Logger.info('useAuthRedirect: Redirecting to auth', { returnUrl, authUrl });
    router.push(authUrl);
  };

  const redirectToProtected = (route: string = '/chat') => {
    Logger.info('useAuthRedirect: Redirecting to protected route', { route });
    router.replace(route);
  };

  const redirectWithReturn = (destination: string) => {
    const returnUrl = `${destination}?returnUrl=${encodeURIComponent(pathname)}`;
    Logger.info('useAuthRedirect: Redirecting with return URL', { destination, returnUrl });
    router.push(returnUrl);
  };

  const handleAuthSuccess = (intendedDestination?: string) => {
    const destination = intendedDestination || '/chat';
    Logger.info('useAuthRedirect: Handling auth success', { destination });
    router.replace(destination);
  };

  const storeIntendedDestination = (destination: string) => {
    try {
      localStorage?.setItem('intendedDestination', destination);
      Logger.debug('useAuthRedirect: Stored intended destination', { destination });
    } catch (error) {
      Logger.warn('useAuthRedirect: Failed to store intended destination', { error });
    }
  };

  const getStoredDestination = (): string | null => {
    try {
      const stored = localStorage?.getItem('intendedDestination');
      if (stored) {
        localStorage.removeItem('intendedDestination');
        Logger.debug('useAuthRedirect: Retrieved stored destination', { destination: stored });
        return stored;
      }
    } catch (error) {
      Logger.warn('useAuthRedirect: Failed to get stored destination', { error });
    }
    return null;
  };

  return {
    redirectToAuth,
    redirectToProtected,
    redirectWithReturn,
    handleAuthSuccess,
    storeIntendedDestination,
    getStoredDestination
  };
}

/**
 * Component for handling OAuth callbacks and deep links
 */
export interface AuthCallbackHandlerProps {
  onSuccess?: (destination: string) => void;
  onError?: (error: string) => void;
  defaultSuccessRoute?: string;
}

export function AuthCallbackHandler({
  onSuccess,
  onError,
  defaultSuccessRoute = '/chat'
}: AuthCallbackHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const searchParams = useSearchParams();
  const { handleAuthSuccess, getStoredDestination } = useAuthRedirect();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for OAuth errors
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          const errorMessage = errorDescription || `OAuth error: ${error}`;
          Logger.error('AuthCallbackHandler: OAuth error', { error, errorDescription });
          
          if (onError) {
            onError(errorMessage);
          }
          return;
        }

        // Check for success indicators
        const code = searchParams.get('code');
        const accessToken = searchParams.get('access_token');

        if (code || accessToken) {
          Logger.info('AuthCallbackHandler: OAuth success detected');
          
          // Get intended destination
          const intendedDestination = getStoredDestination() || defaultSuccessRoute;
          
          if (onSuccess) {
            onSuccess(intendedDestination);
          } else {
            handleAuthSuccess(intendedDestination);
          }
        } else {
          Logger.warn('AuthCallbackHandler: No OAuth parameters found');
          
          if (onError) {
            onError('No authentication data received');
          }
        }
      } catch (error) {
        Logger.error('AuthCallbackHandler: Callback processing failed', { error });
        
        if (onError) {
          onError('Failed to process authentication callback');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, onSuccess, onError, defaultSuccessRoute, handleAuthSuccess, getStoredDestination]);

  if (isProcessing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Processing authentication...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
});

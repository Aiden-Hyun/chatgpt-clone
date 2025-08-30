import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Logger } from '../../../service/shared/utils/Logger';
import { useProtectedRoute, UseProtectedRouteOptions } from '../hooks/useProtectedRoute';

export interface ProtectedRouteProps extends UseProtectedRouteOptions {
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
  errorComponent?: (error: string) => ReactNode;
  showAuthorizationDetails?: boolean;
  onAuthorizationChange?: (isAuthorized: boolean, isAuthenticated: boolean) => void;
}

/**
 * ProtectedRoute - Component wrapper for route protection
 * 
 * This component handles:
 * - Authentication checks
 * - Permission validation
 * - Loading states
 * - Error handling
 * - Automatic redirects
 * - Custom fallback components
 */
export function ProtectedRoute({
  children,
  fallback,
  loadingComponent,
  unauthorizedComponent,
  errorComponent,
  showAuthorizationDetails = false,
  onAuthorizationChange,
  ...protectedRouteOptions
}: ProtectedRouteProps) {
  const {
    isAuthorized,
    isLoading,
    isAuthenticated,
    session,
    error,
    authorizationDetails
  } = useProtectedRoute(protectedRouteOptions);

  // Notify parent component of authorization changes
  React.useEffect(() => {
    if (onAuthorizationChange) {
      onAuthorizationChange(isAuthorized, isAuthenticated);
    }
  }, [isAuthorized, isAuthenticated, onAuthorizationChange]);

  // Log authorization status for debugging
  React.useEffect(() => {
    if (!isLoading) {
      Logger.debug('ProtectedRoute: Authorization status', {
        isAuthorized,
        isAuthenticated,
        userId: session?.userId,
        userPermissions: authorizationDetails.userPermissions,
        requiredPermissions: authorizationDetails.requiredPermissions,
        error
      });
    }
  }, [isLoading, isAuthorized, isAuthenticated, session, authorizationDetails, error]);

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking authorization...</Text>
        {showAuthorizationDetails && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Validating access permissions</Text>
          </View>
        )}
      </View>
    );
  }

  // Show error state
  if (error && !isAuthorized) {
    if (errorComponent) {
      return <>{errorComponent(error)}</>;
    }

    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Access Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          {showAuthorizationDetails && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Authorization Details:</Text>
              <Text style={styles.debugText}>
                • Authenticated: {isAuthenticated ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.debugText}>
                • Valid Session: {authorizationDetails.hasValidSession ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.debugText}>
                • Session Expired: {authorizationDetails.sessionExpired ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.debugText}>
                • Has Required Permissions: {authorizationDetails.hasRequiredPermissions ? 'Yes' : 'No'}
              </Text>
              {authorizationDetails.userPermissions.length > 0 && (
                <Text style={styles.debugText}>
                  • User Permissions: {authorizationDetails.userPermissions.join(', ')}
                </Text>
              )}
              {authorizationDetails.requiredPermissions.length > 0 && (
                <Text style={styles.debugText}>
                  • Required Permissions: {authorizationDetails.requiredPermissions.join(', ')}
                </Text>
              )}
              {authorizationDetails.missingPermissions.length > 0 && (
                <Text style={styles.debugText}>
                  • Missing Permissions: {authorizationDetails.missingPermissions.join(', ')}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={styles.centerContainer}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedTitle}>
            {!isAuthenticated ? 'Authentication Required' : 'Access Denied'}
          </Text>
          <Text style={styles.unauthorizedMessage}>
            {!isAuthenticated 
              ? 'Please sign in to access this content.'
              : 'You don\'t have permission to access this content.'
            }
          </Text>
          {showAuthorizationDetails && authorizationDetails.missingPermissions.length > 0 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Missing Permissions:</Text>
              {authorizationDetails.missingPermissions.map((permission, index) => (
                <Text key={index} style={styles.debugText}>• {permission}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: UseProtectedRouteOptions = {}
) {
  const ProtectedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
}

/**
 * Conditional rendering based on permissions
 */
export interface ConditionalRenderProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  session?: unknown;
}

export function ConditionalRender({
  children,
  requiredPermissions = [],
  requireAll = false,
  fallback = null
}: ConditionalRenderProps) {
  const {
    isAuthorized,
    isLoading,
    authorizationDetails
  } = useProtectedRoute({
    requiredPermissions,
    requireAuthentication: requiredPermissions.length > 0,
    autoRedirect: false
  });

  if (isLoading) {
    return null; // Don't show anything while checking
  }

  if (!isAuthorized && requiredPermissions.length > 0) {
    return <>{fallback}</>;
  }

  // If no specific permissions required, show content
  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check permissions
  const userPermissions = authorizationDetails.userPermissions;
  
  const hasPermission = requireAll
    ? requiredPermissions.every(perm => userPermissions.includes(perm) || userPermissions.includes('admin'))
    : requiredPermissions.some(perm => userPermissions.includes(perm) || userPermissions.includes('admin'));

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Permission-based component visibility
 */
export interface PermissionGateProps {
  children: ReactNode;
  permissions: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  inverse?: boolean; // Show when user DOESN'T have permissions
}

export function PermissionGate({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  inverse = false
}: PermissionGateProps) {
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  const {
    isLoading,
    authorizationDetails
  } = useProtectedRoute({
    requiredPermissions: permissionArray,
    requireAuthentication: true,
    autoRedirect: false
  });

  if (isLoading) {
    return null;
  }

  const userPermissions = authorizationDetails.userPermissions;
  
  // Admin has all permissions
  if (userPermissions.includes('admin')) {
    return inverse ? <>{fallback}</> : <>{children}</>;
  }

  const hasPermission = requireAll
    ? permissionArray.every(perm => userPermissions.includes(perm))
    : permissionArray.some(perm => userPermissions.includes(perm));

  const shouldShow = inverse ? !hasPermission : hasPermission;
  
  return shouldShow ? <>{children}</> : <>{fallback}</>;
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  errorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22
  },
  unauthorizedContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 8,
    textAlign: 'center'
  },
  unauthorizedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22
  },
  debugContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace'
  }
});

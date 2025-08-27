// Enhanced Auth Context for /source implementation
// Follows layered architecture: Presentation layer uses business use cases for auth
// Provides complete auth functionality with token refresh, error handling, and navigation

import { Session } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserSession } from '../../../business/session/entities/UserSession';
import { AuthErrorHandler } from '../../../service/auth/utils/AuthErrorHandler';
import { TokenValidator } from '../../../service/auth/validators/TokenValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { useAuthNavigation } from '../hooks/useAuthNavigation';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  userSession: UserSession | null;
  error: string | null;
  isRefreshing: boolean;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Enhanced Auth Provider with complete functionality
 * - Auto token refresh mechanism
 * - Auth state subscription
 * - Error handling with toast notifications
 * - Loading states management
 * - Navigation integration
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { useCaseFactory } = useBusinessContext();
  const { navigateToAuth, getCurrentRoute } = useAuthNavigation();
  
  // Refs for cleanup and preventing race conditions
  const mounted = useRef(true);
  const authMonitorUnsubscribe = useRef<(() => void) | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create compatible Supabase session from UserSession
   */
  const createCompatibleSession = useCallback((userSession: UserSession): Session => {
    return {
      access_token: userSession.accessToken || '',
      refresh_token: userSession.refreshToken || '',
      expires_in: Math.floor(userSession.getTimeUntilExpiry() / 1000),
      expires_at: Math.floor(userSession.expiresAt.getTime() / 1000),
      token_type: 'bearer',
      user: {
        id: userSession.userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: '', // Could be populated from user repository if needed
        created_at: userSession.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: userSession.createdAt.toISOString(),
        app_metadata: {},
        user_metadata: { permissions: userSession.permissions }
      }
    };
  }, []);

  /**
   * Update auth state with new session
   */
  const updateAuthState = useCallback((newUserSession: UserSession | null) => {
    if (!mounted.current) return;

    if (newUserSession) {
      const compatSession = createCompatibleSession(newUserSession);
      setUserSession(newUserSession);
      setSession(compatSession);
      Logger.info('AuthContext: Auth state updated', { userId: newUserSession.userId });
    } else {
      setUserSession(null);
      setSession(null);
      Logger.info('AuthContext: Auth state cleared');
    }
  }, [createCompatibleSession]);

  /**
   * Refresh session tokens
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!userSession?.refreshToken || isRefreshing) {
      return false;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      Logger.info('AuthContext: Refreshing session tokens');

      const refreshTokenUseCase = useCaseFactory.createRefreshTokenUseCase();
      const result = await refreshTokenUseCase.execute({
        refreshToken: userSession.refreshToken,
        userId: userSession.userId
      });

      if (result.success && result.session) {
        updateAuthState(result.session);
        Logger.info('AuthContext: Session refreshed successfully');
        return true;
      } else {
        const errorMessage = AuthErrorHandler.getMessageFromError(result.error);
        setError(errorMessage);
        Logger.warn('AuthContext: Session refresh failed', { error: result.error });
        
        // If refresh fails, sign out user
        await signOut();
        return false;
      }
    } catch (error) {
      const errorMessage = AuthErrorHandler.getMessageFromError(error);
      setError(errorMessage);
      Logger.error('AuthContext: Session refresh error', { error });
      await signOut();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [userSession, isRefreshing, useCaseFactory, updateAuthState]);

  /**
   * Sign out user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      Logger.info('AuthContext: Signing out user');

      const signOutUseCase = useCaseFactory.createSignOutUseCase();
      await signOutUseCase.execute();

      updateAuthState(null);
      setError(null);

      // Navigate to auth screen
      const currentRoute = getCurrentRoute();
      if (currentRoute && !currentRoute.startsWith('/auth')) {
        navigateToAuth({ clearHistory: true });
      }

      Logger.info('AuthContext: User signed out successfully');
    } catch (error) {
      Logger.error('AuthContext: Sign out error', { error });
      // Even if sign out fails, clear local state
      updateAuthState(null);
    }
  }, [useCaseFactory, updateAuthState, getCurrentRoute, navigateToAuth]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if token needs refresh
   */
  const checkTokenRefresh = useCallback(async () => {
    if (!userSession?.accessToken || isRefreshing) {
      return;
    }

    try {
      if (TokenValidator.shouldRefreshToken(userSession.accessToken)) {
        Logger.info('AuthContext: Token needs refresh, refreshing...');
        await refreshSession();
      }
    } catch (error) {
      Logger.error('AuthContext: Error checking token refresh', { error });
    }
  }, [userSession, isRefreshing, refreshSession]);

  /**
   * Initialize auth state and monitoring
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        Logger.info('AuthContext: Initializing auth state');

        // Get current session
        const getSessionUseCase = useCaseFactory.createGetSessionUseCase();
        const sessionResult = await getSessionUseCase.execute();

        if (sessionResult.success && sessionResult.session) {
          updateAuthState(sessionResult.session);
        } else {
          updateAuthState(null);
          Logger.info('AuthContext: No valid session found');
        }

        // Set up auth state monitoring
        const monitorAuthStateUseCase = useCaseFactory.createMonitorAuthStateUseCase();
        const monitorResult = await monitorAuthStateUseCase.execute();

        if (monitorResult.success && monitorResult.unsubscribe) {
          authMonitorUnsubscribe.current = monitorResult.unsubscribe;
          Logger.info('AuthContext: Auth state monitoring started');
        }

        // Set up periodic token refresh check
        refreshInterval.current = setInterval(checkTokenRefresh, 60000); // Check every minute

        setIsLoading(false);
        Logger.info('AuthContext: Auth initialization completed');

      } catch (error) {
        Logger.error('AuthContext: Auth initialization failed', { error });
        const errorMessage = AuthErrorHandler.getMessageFromError(error);
        setError(errorMessage);
        updateAuthState(null);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted.current = false;
      
      // Clean up auth monitoring
      if (authMonitorUnsubscribe.current) {
        authMonitorUnsubscribe.current();
        authMonitorUnsubscribe.current = null;
      }

      // Clean up refresh interval
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }

      Logger.info('AuthContext: Cleanup completed');
    };
  }, [useCaseFactory, updateAuthState, checkTokenRefresh]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    session,
    isLoading,
    userSession,
    error,
    isRefreshing,
    refreshSession,
    clearError,
    signOut
  }), [session, isLoading, userSession, error, isRefreshing, refreshSession, clearError, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Provides same interface as existing useAuth hook for compatibility
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook to access the /source UserSession directly
 * Use this when you need access to /source-specific session features
 */
export function useUserSession(): UserSession | null {
  const { userSession } = useAuth();
  return userSession;
}

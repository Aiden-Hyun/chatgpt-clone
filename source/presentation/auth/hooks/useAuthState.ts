/**
 * Simple Auth State Hook
 * Provides simple auth state checking without complex monitoring
 * Replaces complex useProtectedRoute and useAuthStateMonitor
 */

import { useCallback, useEffect, useState } from 'react';

import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { UseAuthStateResult } from '../types/auth.types';

/**
 * Simple hook for checking authentication state
 * Uses business layer GetAuthStateUseCase for one-time checks
 */
export function useAuthState(): UseAuthStateResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const { useCaseFactory } = useBusinessContext();

  /**
   * Check authentication state using business layer
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      // Use business layer to get auth state
      const getAuthStateUseCase = useCaseFactory.createGetAuthStateUseCase();
      const result = await getAuthStateUseCase.execute();

      if (result.success) {
        const hasValidSession = !!result.session;
        setIsAuthenticated(hasValidSession);
        setSession(result.session);
        
        Logger.debug('useAuthState: Auth check completed', {
          isAuthenticated: hasValidSession,
          userId: result.session?.userId
        });
      } else {
        setIsAuthenticated(false);
        setSession(null);
        setError(result.error);
        
        Logger.warn('useAuthState: Auth check failed', {
          error: result.error
        });
      }
    } catch (error) {
      Logger.error('useAuthState: Auth check error', { error });
      setIsAuthenticated(false);
      setSession(null);
      setError(error instanceof Error ? error.message : 'Auth check failed');
    } finally {
      setIsLoading(false);
    }
  }, [useCaseFactory]);

  /**
   * Initial auth check on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    session,
    error,
    checkAuth
  };
}

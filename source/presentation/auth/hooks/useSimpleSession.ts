/**
 * Simple Session Hook
 * Replaces complex useSession with simple session state management
 * Uses business layer GetAuthStateUseCase
 */

import { useCallback, useEffect, useState } from 'react';

import { UserSession } from '../../../business/interfaces/session';
import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { UseSimpleSessionResult } from '../types/session.types';

/**
 * Simple session hook for basic session management
 * Provides session state without complex business logic
 */
export function useSimpleSession(): UseSimpleSessionResult {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const { useCaseFactory } = useBusinessContext();

  /**
   * Load session from business layer
   */
  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const getAuthStateUseCase = useCaseFactory.createGetAuthStateUseCase();
      const result = await getAuthStateUseCase.execute();

      if (result.success) {
        setSession(result.session);
        Logger.debug('useSimpleSession: Session loaded', {
          hasSession: !!result.session,
          userId: result.session?.userId
        });
      } else {
        setSession(null);
        setError(result.error);
        Logger.warn('useSimpleSession: Failed to load session', {
          error: result.error
        });
      }
    } catch (error) {
      Logger.error('useSimpleSession: Load session error', { error });
      setSession(null);
      setError(error instanceof Error ? error.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, [useCaseFactory]);

  /**
   * Clear session state
   */
  const clearSession = useCallback(() => {
    setSession(null);
    setError(undefined);
    Logger.debug('useSimpleSession: Session cleared');
  }, []);

  /**
   * Check if session is valid
   */
  const hasValidSession = session ? !session.isExpired() : false;

  /**
   * Load session on mount
   */
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    isLoading,
    error,
    loadSession,
    clearSession,
    hasValidSession
  };
}

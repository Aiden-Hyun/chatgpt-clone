import { useCallback, useEffect, useState } from 'react';
import { UserSession } from '../../../business/session/entities/UserSession';
import { SessionExpiryCalculator } from '../../../service/session/utils/SessionExpiryCalculator';
import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

export interface SessionState {
  session: UserSession | null;
  isLoading: boolean;
  error: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  timeUntilExpiry: number;
  sessionHealth: 'healthy' | 'warning' | 'expired';
}

export interface SessionActions {
  refreshSession: () => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  updateLastActivity: () => Promise<void>;
  getSessionDetails: () => Promise<SessionState['session']>;
}

export interface UseSessionHook extends SessionState, SessionActions {}

export function useSession(): UseSessionHook {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [sessionHealth, setSessionHealth] = useState<'healthy' | 'warning' | 'expired'>('expired');

  const { useCaseFactory } = useBusinessContext();
  
  // Create UseCases once at hook level using useMemo
  const getSessionUseCase = useMemo(() => 
    useCaseFactory.createGetSessionUseCase(), [useCaseFactory]
  );
  const refreshTokenUseCase = useMemo(() => 
    useCaseFactory.createRefreshTokenUseCase(), [useCaseFactory]
  );
  const validateSessionUseCase = useMemo(() => 
    useCaseFactory.createValidateSessionUseCase(), [useCaseFactory]
  );
  const updateActivityUseCase = useMemo(() => 
    useCaseFactory.createUpdateSessionActivityUseCase(), [useCaseFactory]
  );

  /**
   * Update session state and derived values
   */
  const updateSessionState = useCallback((newSession: UserSession | null) => {
    setSession(newSession);

    if (!newSession) {
      setIsExpired(true);
      setIsExpiringSoon(false);
      setTimeUntilExpiry(0);
      setSessionHealth('expired');
      return;
    }

    // Calculate session health and timing
    const timeInfo = SessionExpiryCalculator.getTimeUntilExpiry(newSession.expiresAt);
    const healthInfo = SessionExpiryCalculator.getSessionHealth(newSession.expiresAt);
    const warningInfo = SessionExpiryCalculator.isInWarningPeriod(newSession.expiresAt);

    setIsExpired(timeInfo.isExpired);
    setIsExpiringSoon(warningInfo.inWarning);
    setTimeUntilExpiry(timeInfo.timeRemaining);
    setSessionHealth(healthInfo.status);

    Logger.info('useSession: Session state updated', {
      userId: newSession.userId,
      isExpired: timeInfo.isExpired,
      isExpiringSoon: warningInfo.inWarning,
      timeUntilExpiry: timeInfo.timeRemaining,
      health: healthInfo.status
    });
  }, []);

  /**
   * Load session from repository
   */
  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getSessionUseCase.execute({ 
        validateExpiry: true,
        refreshIfExpired: false 
      });

      if (result.success && result.session) {
        updateSessionState(result.session);
      } else {
        updateSessionState(null);
        if (result.error && !result.isExpired) {
          setError(result.error);
        }
      }
    } catch (error) {
      Logger.error('useSession: Failed to load session', { error });
      setError('Failed to load session');
      updateSessionState(null);
    } finally {
      setIsLoading(false);
    }
  }, [getSessionUseCase, updateSessionState]);

  /**
   * Refresh session tokens
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      Logger.info('useSession: Refreshing session');

      if (!session?.refreshToken) {
        setError('No refresh token available');
        return false;
      }

      const result = await refreshTokenUseCase.execute({
        refreshToken: session.refreshToken,
        userId: session.userId
      });

      if (result.success && result.session) {
        updateSessionState(result.session);
        Logger.info('useSession: Session refreshed successfully');
        return true;
      } else {
        setError(result.error || 'Session refresh failed');
        Logger.warn('useSession: Session refresh failed', { error: result.error });
        return false;
      }
    } catch (error) {
      Logger.error('useSession: Session refresh error', { error });
      setError('Session refresh failed');
      return false;
    }
  }, [session, refreshTokenUseCase, updateSessionState]);

  /**
   * Validate current session
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      Logger.info('useSession: Validating session');

      const result = await validateSessionUseCase.execute({ 
        autoRefresh: true 
      });

      if (result.success && result.isValid && result.session) {
        updateSessionState(result.session);
        Logger.info('useSession: Session validation successful', {
          wasRefreshed: result.validationDetails.wasRefreshed
        });
        return true;
      } else {
        if (result.session) {
          updateSessionState(result.session);
        } else {
          updateSessionState(null);
        }
        
        if (result.error) {
          setError(result.error);
        }
        
        Logger.warn('useSession: Session validation failed', { 
          error: result.error,
          validationDetails: result.validationDetails 
        });
        return false;
      }
    } catch (error) {
      Logger.error('useSession: Session validation error', { error });
      setError('Session validation failed');
      return false;
    }
  }, [validateSessionUseCase, updateSessionState]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Update last activity timestamp
   */
  const updateLastActivity = useCallback(async (): Promise<void> => {
    try {
      if (!session) {
        return;
      }

      await updateActivityUseCase.execute({ userId: session.userId });

      // Update local session state
      if (session) {
        const updatedSession = { ...session };
        updatedSession.lastActivity = new Date();
        updateSessionState(updatedSession);
      }

      Logger.debug('useSession: Last activity updated');
    } catch (error) {
      Logger.error('useSession: Failed to update last activity', { error });
      // Don't set error for this non-critical operation
    }
  }, [session, updateActivityUseCase, updateSessionState]);

  /**
   * Get fresh session details
   */
  const getSessionDetails = useCallback(async (): Promise<UserSession | null> => {
    try {
      const result = await getSessionUseCase.execute({ validateExpiry: true });
      
      return result.success && result.session ? result.session : null;
    } catch (error) {
      Logger.error('useSession: Failed to get session details', { error });
      return null;
    }
  }, [getSessionUseCase]);

  /**
   * Set up periodic session validation
   */
  useEffect(() => {
    let validationInterval: NodeJS.Timeout | null = null;

    const startPeriodicValidation = () => {
      // Validate session every 30 seconds
      validationInterval = setInterval(async () => {
        if (session && !isExpired) {
          await validateSession();
        }
      }, 30000);
    };

    if (session && !isExpired) {
      startPeriodicValidation();
    }

    return () => {
      if (validationInterval) {
        clearInterval(validationInterval);
      }
    };
  }, [session, isExpired, validateSession]);

  /**
   * Set up automatic refresh when session is expiring soon
   */
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout | null = null;

    if (session && isExpiringSoon && !isExpired) {
      Logger.info('useSession: Session expiring soon, scheduling refresh', {
        timeUntilExpiry,
        userId: session.userId
      });

      // Schedule refresh for when we hit the refresh threshold
      const refreshDelay = Math.max(1000, timeUntilExpiry - (5 * 60 * 1000)); // 5 minutes before expiry
      
      refreshTimeout = setTimeout(async () => {
        Logger.info('useSession: Auto-refreshing expiring session');
        await refreshSession();
      }, refreshDelay);
    }

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [session, isExpiringSoon, isExpired, timeUntilExpiry, refreshSession]);

  /**
   * Initial session load
   */
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    // State
    session,
    isLoading,
    error,
    isExpired,
    isExpiringSoon,
    timeUntilExpiry,
    sessionHealth,

    // Actions
    refreshSession,
    validateSession,
    clearError,
    updateLastActivity,
    getSessionDetails
  };
}

/**
 * Hook for session expiry information only
 */
export function useSessionExpiry(session: UserSession | null) {
  const [expiryInfo, setExpiryInfo] = useState({
    timeUntilExpiry: 0,
    isExpired: true,
    isExpiringSoon: false,
    formattedTime: 'Expired',
    health: 'expired' as 'healthy' | 'warning' | 'expired'
  });

  useEffect(() => {
    if (!session) {
      setExpiryInfo({
        timeUntilExpiry: 0,
        isExpired: true,
        isExpiringSoon: false,
        formattedTime: 'Expired',
        health: 'expired'
      });
      return;
    }

    const updateExpiryInfo = () => {
      const timeInfo = SessionExpiryCalculator.getTimeUntilExpiry(session.expiresAt);
      const healthInfo = SessionExpiryCalculator.getSessionHealth(session.expiresAt);
      const warningInfo = SessionExpiryCalculator.isInWarningPeriod(session.expiresAt);
      const formattedTime = SessionExpiryCalculator.formatTimeRemaining(session.expiresAt);

      setExpiryInfo({
        timeUntilExpiry: timeInfo.timeRemaining,
        isExpired: timeInfo.isExpired,
        isExpiringSoon: warningInfo.inWarning,
        formattedTime,
        health: healthInfo.status
      });
    };

    // Update immediately
    updateExpiryInfo();

    // Update every second for real-time countdown
    const interval = setInterval(updateExpiryInfo, 1000);

    return () => clearInterval(interval);
  }, [session]);

  return expiryInfo;
}

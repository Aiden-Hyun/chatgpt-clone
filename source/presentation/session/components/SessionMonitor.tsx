import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { SessionExpiryCalculator } from '../../../service/session/utils/SessionExpiryCalculator';
import { Logger } from '../../../service/shared/utils/Logger';
import { useAutoLogout } from '../../auth/hooks/useAutoLogout';
import { SessionMonitorProps, SessionMonitorState } from '../../interfaces/session';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

/**
 * SessionMonitor - Background component that monitors session state
 * - Periodic session validation
 * - Auto-refresh when needed
 * - Auto-logout when expired
 * - Toast notifications for session events
 */
export function SessionMonitor({
  session,
  onSessionExpired,
  onSessionExpiring,
  onSessionRefreshed,
  onSessionError,
  enableAutoRefresh = true,
  enableAutoLogout = true,
  warningThresholdMinutes = 15,
  refreshThresholdMinutes = 5,
  children
}: SessionMonitorProps) {
  const [state, setState] = useState<SessionMonitorState>({
    isMonitoring: false,
    lastCheck: null,
    refreshAttempts: 0,
    autoLogoutScheduled: false
  });

  const { useCaseFactory } = useBusinessContext();
  const { checkAutoLogout } = useAutoLogout();
  
  // Refs to prevent stale closures and manage timers
  const sessionRef = useRef(session);
  const validationInterval = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeout = useRef<NodeJS.Timeout | null>(null);
  const warningShown = useRef(false);
  const mounted = useRef(true);

  // Update session ref when session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  /**
   * Validate current session
   */
  const validateSession = useCallback(async (): Promise<void> => {
    if (!mounted.current || !sessionRef.current) {
      return;
    }

    try {
      Logger.debug('SessionMonitor: Validating session');

      const validateSessionUseCase = useCaseFactory.createValidateSessionUseCase();
      const result = await validateSessionUseCase.execute({ 
        autoRefresh: enableAutoRefresh 
      });

      if (!mounted.current) return;

      setState(prev => ({ 
        ...prev, 
        lastCheck: new Date(),
        refreshAttempts: result.validationDetails.wasRefreshed ? 0 : prev.refreshAttempts
      }));

      if (result.success && result.isValid) {
        // Session is valid
        if (result.validationDetails.wasRefreshed && result.session && onSessionRefreshed) {
          Logger.info('SessionMonitor: Session was refreshed during validation');
          onSessionRefreshed(result.session);
        }

        // Check if session is expiring soon
        if (result.session) {
          const warningInfo = SessionExpiryCalculator.isInWarningPeriod(
            result.session.expiresAt, 
            warningThresholdMinutes
          );

          if (warningInfo.inWarning && !warningShown.current) {
            Logger.warn('SessionMonitor: Session expiring soon', { 
              timeRemaining: warningInfo.timeRemaining 
            });
            warningShown.current = true;
            onSessionExpiring?.(warningInfo.timeRemaining);
          } else if (!warningInfo.inWarning && warningShown.current) {
            // Reset warning flag if we're no longer in warning period (after refresh)
            warningShown.current = false;
          }
        }
      } else {
        // Session is invalid or expired
        Logger.warn('SessionMonitor: Session validation failed', { 
          error: result.error,
          validationDetails: result.validationDetails 
        });

        if (result.validationDetails.isExpired) {
          handleSessionExpired();
        } else if (result.error && onSessionError) {
          onSessionError(result.error);
        }
      }
    } catch (error) {
      Logger.error('SessionMonitor: Session validation error', { error });
      if (onSessionError) {
        onSessionError('Session validation failed');
      }
    }
  }, [
    useCaseFactory, 
    enableAutoRefresh, 
    warningThresholdMinutes, 
    onSessionRefreshed, 
    onSessionExpiring, 
    onSessionError
  ]);

  /**
   * Handle session expiry
   */
  const handleSessionExpired = useCallback((): void => {
    Logger.warn('SessionMonitor: Session has expired');

    // Clear any pending timers
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }

    // Schedule auto-logout if enabled
    if (enableAutoLogout && !state.autoLogoutScheduled) {
      scheduleAutoLogout();
    }

    // Notify about expiry
    onSessionExpired?.();
  }, [enableAutoLogout, state.autoLogoutScheduled, onSessionExpired]);

  /**
   * Schedule automatic logout
   */
  const scheduleAutoLogout = useCallback((): void => {
    if (logoutTimeout.current || state.autoLogoutScheduled) {
      return;
    }

    Logger.info('SessionMonitor: Scheduling auto-logout');

    setState(prev => ({ ...prev, autoLogoutScheduled: true }));

    // Auto-logout after 30 seconds grace period
    logoutTimeout.current = setTimeout(async () => {
      if (!mounted.current) return;

      try {
        Logger.info('SessionMonitor: Executing auto-logout');

        // Use the business layer auto-logout hook
        const result = await checkAutoLogout({
          gracePeriodMinutes: 0,
          forceLogout: true,
          reason: 'Session expired'
        });

        if (result.loggedOut) {
          Logger.info('SessionMonitor: Auto-logout completed successfully');
        } else {
          Logger.warn('SessionMonitor: Auto-logout did not complete', { reason: result.reason });
        }
      } catch (error) {
        Logger.error('SessionMonitor: Auto-logout failed', { error });
      }
    }, 30000); // 30 second grace period
  }, [state.autoLogoutScheduled, checkAutoLogout]);

  /**
   * Schedule session refresh
   */
  const scheduleRefresh = useCallback((): void => {
    if (!sessionRef.current || refreshTimeout.current || !enableAutoRefresh) {
      return;
    }

    const refreshTime = SessionExpiryCalculator.calculateOptimalRefreshTime(
      sessionRef.current.expiresAt,
      refreshThresholdMinutes
    );

    if (refreshTime <= 0) {
      // Refresh immediately
      performRefresh();
      return;
    }

    Logger.info('SessionMonitor: Scheduling session refresh', { 
      refreshInMs: refreshTime,
      refreshInMinutes: Math.round(refreshTime / 60000) 
    });

    refreshTimeout.current = setTimeout(() => {
      performRefresh();
    }, refreshTime);
  }, [enableAutoRefresh, refreshThresholdMinutes]);

  /**
   * Perform session refresh
   */
  const performRefresh = useCallback(async (): Promise<void> => {
    if (!mounted.current || !sessionRef.current?.refreshToken) {
      return;
    }

    try {
      Logger.info('SessionMonitor: Performing scheduled refresh');

      setState(prev => ({ ...prev, refreshAttempts: prev.refreshAttempts + 1 }));

      const refreshTokenUseCase = useCaseFactory.createRefreshTokenUseCase();
      const result = await refreshTokenUseCase.execute({
        refreshToken: sessionRef.current!.refreshToken,
        userId: sessionRef.current!.userId
      });

      if (!mounted.current) return;

      if (result.success && result.session) {
        Logger.info('SessionMonitor: Scheduled refresh successful');
        setState(prev => ({ ...prev, refreshAttempts: 0 }));
        onSessionRefreshed?.(result.session);
        
        // Schedule next refresh
        scheduleRefresh();
      } else {
        Logger.warn('SessionMonitor: Scheduled refresh failed', { 
          error: result.error,
          attempts: state.refreshAttempts + 1 
        });

        // If refresh failed multiple times, treat as expired
        if (state.refreshAttempts >= 2) {
          handleSessionExpired();
        } else if (onSessionError) {
          onSessionError(result.error || 'Session refresh failed');
        }
      }
    } catch (error) {
      Logger.error('SessionMonitor: Refresh error', { error });
      if (onSessionError) {
        onSessionError('Session refresh failed');
      }
    }
  }, [
    useCaseFactory, 
    state.refreshAttempts, 
    onSessionRefreshed, 
    onSessionError, 
    handleSessionExpired, 
    scheduleRefresh
  ]);

  /**
   * Handle app state changes
   */
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus): void => {
    Logger.debug('SessionMonitor: App state changed', { nextAppState });

    if (nextAppState === 'active' && sessionRef.current) {
      // App became active, validate session
      Logger.info('SessionMonitor: App became active, validating session');
      validateSession();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background, update last activity
      if (sessionRef.current) {
        Logger.debug('SessionMonitor: App went to background, updating last activity');
        // Update last activity timestamp
        // This could be done via the useSession hook or directly here
      }
    }
  }, [validateSession]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback((): void => {
    if (state.isMonitoring || !session) {
      return;
    }

    Logger.info('SessionMonitor: Starting session monitoring');

    setState(prev => ({ ...prev, isMonitoring: true }));

    // Start periodic validation (every 60 seconds)
    validationInterval.current = setInterval(validateSession, 60000);

    // Schedule initial refresh if needed
    scheduleRefresh();

    // Listen to app state changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup function
    return () => {
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
    };
  }, [state.isMonitoring, session, validateSession, scheduleRefresh, handleAppStateChange]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback((): void => {
    Logger.info('SessionMonitor: Stopping session monitoring');

    setState(prev => ({ 
      ...prev, 
      isMonitoring: false,
      refreshAttempts: 0,
      autoLogoutScheduled: false 
    }));

    // Clear all timers
    if (validationInterval.current) {
      clearInterval(validationInterval.current);
      validationInterval.current = null;
    }

    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }

    if (logoutTimeout.current) {
      clearTimeout(logoutTimeout.current);
      logoutTimeout.current = null;
    }

    // Reset warning flag
    warningShown.current = false;
  }, []);

  /**
   * Start/stop monitoring based on session presence
   */
  useEffect(() => {
    if (session && !state.isMonitoring) {
      const cleanup = startMonitoring();
      return cleanup;
    } else if (!session && state.isMonitoring) {
      stopMonitoring();
    }
  }, [session, state.isMonitoring, startMonitoring, stopMonitoring]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mounted.current = false;
      stopMonitoring();
    };
  }, [stopMonitoring]);

  // SessionMonitor is typically a background component
  // It can optionally render children or status information
  if (children) {
    return <>{children}</>;
  }

  return null;
}

/**
 * Hook version of SessionMonitor for easier integration
 */
export function useSessionMonitor(
  session: UserSession | null
) {

  useEffect(() => {
    // This would typically be handled by the SessionMonitor component
    // For the hook version, we just log the monitoring status
    if (session) {
      Logger.info('useSessionMonitor: Monitoring session', { userId: session.userId });
    } else {
      Logger.info('useSessionMonitor: No session to monitor');
    }
  }, [session]);

  return {
    isMonitoring: !!session,
    lastCheck: new Date(),
    refreshAttempts: 0
  };
}

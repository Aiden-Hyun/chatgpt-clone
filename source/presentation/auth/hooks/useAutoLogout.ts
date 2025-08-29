import { useCallback, useMemo } from 'react';
import { useToast } from '../../alert/toast';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

/**
 * Hook for handling automatic logout functionality using business layer UseCases
 * Provides proper business logic for session expiry and auto-logout
 */
export function useAutoLogout() {
  const { useCaseFactory } = useBusinessContext();
  const { showSuccess, showError, showWarning } = useToast();

  // Create AutoLogoutUseCase once using useMemo
  const autoLogoutUseCase = useMemo(() => 
    useCaseFactory.createAutoLogoutUseCase(), [useCaseFactory]
  );

  // Check if auto-logout is needed
  const checkAutoLogout = useCallback(async (options: {
    gracePeriodMinutes?: number;
    forceLogout?: boolean;
    reason?: string;
  } = {}) => {
    try {
      const result = await autoLogoutUseCase.execute({
        gracePeriodMinutes: options.gracePeriodMinutes || 5,
        forceLogout: options.forceLogout || false,
        reason: options.reason || 'Session expired'
      });

      if (result.success) {
        if (result.loggedOut) {
          showSuccess('You have been automatically logged out for security');
          return { loggedOut: true, reason: result.reason };
        } else {
          return { loggedOut: false, reason: result.reason };
        }
      } else {
        showError(result.error || 'Failed to check session status');
        return { loggedOut: false, error: result.error };
      }
    } catch (error) {
      console.error('Auto-logout check failed:', error);
      showError('Failed to check session status');
      return { loggedOut: false, error: 'Check failed' };
    }
  }, [autoLogoutUseCase, showSuccess, showError]);

  // Force logout
  const forceLogout = useCallback(async (reason: string = 'Manual logout') => {
    try {
      const result = await autoLogoutUseCase.execute({
        forceLogout: true,
        reason
      });

      if (result.success && result.loggedOut) {
        showSuccess('You have been logged out');
        return { success: true };
      } else {
        showError(result.error || 'Failed to logout');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Force logout failed:', error);
      showError('Failed to logout');
      return { success: false, error: 'Logout failed' };
    }
  }, [autoLogoutUseCase, showSuccess, showError]);

  // Schedule auto-logout with warning
  const scheduleAutoLogout = useCallback(async (minutesUntilLogout: number = 5) => {
    try {
      showWarning(`You will be automatically logged out in ${minutesUntilLogout} minutes for security`);
      
      const result = await autoLogoutUseCase.execute({
        gracePeriodMinutes: minutesUntilLogout,
        reason: 'Scheduled logout'
      });

      return result;
    } catch (error) {
      console.error('Failed to schedule auto-logout:', error);
      showError('Failed to schedule auto-logout');
      return { success: false, error: 'Schedule failed' };
    }
  }, [autoLogoutUseCase, showWarning, showError]);

  return {
    checkAutoLogout,
    forceLogout,
    scheduleAutoLogout
  };
}

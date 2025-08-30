import { useEffect, useRef } from 'react';

import { useToast } from '../../alert/toast';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

/**
 * Hook for monitoring authentication state changes using business layer UseCases
 * Replaces direct Supabase usage with proper business logic
 */
export function useAuthStateMonitor() {
  const { useCaseFactory } = useBusinessContext();
  const { showError } = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {

    const startMonitoring = async () => {
      try {
        // Create and execute the MonitorAuthStateUseCase
        const monitorAuthStateUseCase = useCaseFactory.createMonitorAuthStateUseCase();
        const result = await monitorAuthStateUseCase.execute();

        if (result.success && result.unsubscribe) {
          unsubscribeRef.current = result.unsubscribe;
        } else {
          console.error('Failed to start auth state monitoring:', result.error);
        }
      } catch (error) {
        console.error('Error starting auth state monitoring:', error);
        showError('Failed to initialize authentication monitoring');
      }
    };

    startMonitoring();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [useCaseFactory, showError]);

  return {
    isMonitoring: !!unsubscribeRef.current
  };
}

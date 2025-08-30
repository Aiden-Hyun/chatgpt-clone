import { useEffect, useState } from 'react';

import { useSessionViewModel } from '../../../business/session/view-models/useSessionViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export function useSessionStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const useCaseFactory = useUseCaseFactory();
  const sessionViewModel = useSessionViewModel({
    getSessionUseCase: useCaseFactory.createGetSessionUseCase(),
    refreshSessionUseCase: useCaseFactory.createRefreshSessionUseCase(),
    validateSessionUseCase: useCaseFactory.createValidateSessionUseCase(),
    updateActivityUseCase: useCaseFactory.createUpdateSessionActivityUseCase()
  });
  
  const refreshSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await sessionViewModel.refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh session');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-refresh session when it's about to expire
  useEffect(() => {
    const session = sessionViewModel.session;
    if (session?.needsRefresh()) {
      refreshSession();
    }
  }, [sessionViewModel.session]);
  
  return {
    session: sessionViewModel.session,
    isLoading,
    error,
    refreshSession
  };
}

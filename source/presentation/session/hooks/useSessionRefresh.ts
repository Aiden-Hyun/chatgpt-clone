import { useState } from 'react';
import { useSessionViewModel } from '../../../business/session/view-models/useSessionViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export function useSessionRefresh() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  const useCaseFactory = useUseCaseFactory();
  const sessionViewModel = useSessionViewModel({
    getSessionUseCase: useCaseFactory.createGetSessionUseCase(),
    refreshSessionUseCase: useCaseFactory.createRefreshSessionUseCase(),
    validateSessionUseCase: useCaseFactory.createValidateSessionUseCase(),
    updateActivityUseCase: useCaseFactory.createUpdateSessionActivityUseCase()
  });
  
  const refreshSession = async () => {
    setIsLoading(true);
    
    try {
      await sessionViewModel.refreshSession();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    refreshSession,
    isLoading,
    lastRefreshTime
  };
}

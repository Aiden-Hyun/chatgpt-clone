import { useEffect, useState } from 'react';
import { useSessionViewModel } from '../../../business/session/view-models/useSessionViewModel';
import { ExpiryCalculator } from '../../../service/session/utils/ExpiryCalculator';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export function useSessionExpiry() {
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const useCaseFactory = useUseCaseFactory();
  const sessionViewModel = useSessionViewModel({
    getSessionUseCase: useCaseFactory.createGetSessionUseCase(),
    refreshSessionUseCase: useCaseFactory.createRefreshSessionUseCase(),
    validateSessionUseCase: useCaseFactory.createValidateSessionUseCase(),
    updateActivityUseCase: useCaseFactory.createUpdateSessionActivityUseCase()
  });
  
  useEffect(() => {
    const checkExpiry = () => {
      const session = sessionViewModel.session;
      
      if (!session) {
        setIsExpiringSoon(false);
        setTimeRemaining('');
        return;
      }
      
      const expiringSoon = session.isExpiringSoon(30); // 30 minutes
      setIsExpiringSoon(expiringSoon);
      
      if (expiringSoon) {
        const timeUntilExpiry = session.getTimeUntilExpiry();
        setTimeRemaining(ExpiryCalculator.formatTimeRemaining(timeUntilExpiry));
      } else {
        setTimeRemaining('');
      }
    };
    
    // Check immediately
    checkExpiry();
    
    // Check every minute
    const interval = setInterval(checkExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [sessionViewModel.session]);
  
  const refreshSession = async () => {
    setIsLoading(true);
    try {
      await sessionViewModel.refreshSession();
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isExpiringSoon,
    timeRemaining,
    refreshSession,
    isLoading
  };
}

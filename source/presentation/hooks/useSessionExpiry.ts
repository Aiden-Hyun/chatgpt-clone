import { useState, useEffect } from 'react';
import { useSessionViewModel } from '../../business/view-models/useSessionViewModel';
import { ExpiryCalculator } from '../../service/utils/ExpiryCalculator';

export function useSessionExpiry() {
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sessionViewModel = useSessionViewModel();
  
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

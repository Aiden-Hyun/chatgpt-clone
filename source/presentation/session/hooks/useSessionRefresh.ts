import { useState } from 'react';
import { useSessionViewModel } from '../../../business/session/view-models/useSessionViewModel';

export function useSessionRefresh() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  const sessionViewModel = useSessionViewModel();
  
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

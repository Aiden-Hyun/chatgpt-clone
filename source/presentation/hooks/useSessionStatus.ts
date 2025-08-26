import { useState, useEffect } from 'react';
import { useSessionViewModel } from '../../business/view-models/useSessionViewModel';

export function useSessionStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionViewModel = useSessionViewModel();
  
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

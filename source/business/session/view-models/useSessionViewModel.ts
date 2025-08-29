import { useState, useEffect, useCallback } from 'react';

import { UserSession, ISessionViewModelDependencies } from '../../interfaces';

export function useSessionViewModel(dependencies: ISessionViewModelDependencies) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Destructure injected dependencies
  const {
    getSessionUseCase,
    refreshSessionUseCase,
    validateSessionUseCase,
    updateActivityUseCase
  } = dependencies;

  // Load initial session
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Set up activity tracking
  useEffect(() => {
    if (!session) return;

    const handleActivity = () => {
      updateActivityUseCase.execute();
    };

    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [session, updateActivityUseCase]);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSessionUseCase.execute();
      if (result.success) {
        setSession(result.session);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [getSessionUseCase]);

  const refreshSession = async () => {
    if (!session) {
      throw new Error('No session to refresh');
    }

    const result = await refreshSessionUseCase.execute();
    if (result.success) {
      setSession(result.session);
    } else {
      throw new Error(result.error);
    }
  };

  const validateSession = async () => {
    const result = await validateSessionUseCase.execute();
    if (!result.isValid) {
      setSession(null);
      return false;
    }
    return true;
  };

  const updateActivity = async () => {
    if (session) {
      await updateActivityUseCase.execute();
      // Update local session with new activity time
      setSession(session.updateLastActivity());
    }
  };

  return {
    session,
    isLoading,
    loadSession,
    refreshSession,
    validateSession,
    updateActivity
  };
}

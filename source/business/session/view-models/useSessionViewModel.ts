import { useState, useEffect } from 'react';
import { GetSessionUseCase } from '../use-cases/GetSessionUseCase';
import { RefreshSessionUseCase } from '../use-cases/RefreshSessionUseCase';
import { ValidateSessionUseCase } from '../use-cases/ValidateSessionUseCase';
import { UpdateSessionActivityUseCase } from '../use-cases/UpdateSessionActivityUseCase';
import { UserSession, SessionState, SessionActions } from '../../interfaces';

interface SessionViewModelDependencies {
  getSessionUseCase: GetSessionUseCase;
  refreshSessionUseCase: RefreshSessionUseCase;
  validateSessionUseCase: ValidateSessionUseCase;
  updateActivityUseCase: UpdateSessionActivityUseCase;
}

export function useSessionViewModel(dependencies: SessionViewModelDependencies) {
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
  }, []);

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
  }, [session]);

  const loadSession = async () => {
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
  };

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

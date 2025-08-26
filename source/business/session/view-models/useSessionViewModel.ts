import { useState, useEffect } from 'react';
import { GetSessionUseCase } from '../use-cases/GetSessionUseCase';
import { RefreshSessionUseCase } from '../use-cases/RefreshSessionUseCase';
import { ValidateSessionUseCase } from '../use-cases/ValidateSessionUseCase';
import { UpdateSessionActivityUseCase } from '../use-cases/UpdateSessionActivityUseCase';
import { SessionRepository } from '../../../persistence/session/repositories/SessionRepository';
import { UserRepository } from '../../../persistence/auth/repositories/UserRepository';
import { UserSession } from '../entities/UserSession';

export function useSessionViewModel() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize use cases
  const getSessionUseCase = new GetSessionUseCase(
    new SessionRepository(),
    new UserRepository()
  );

  const refreshSessionUseCase = new RefreshSessionUseCase(
    new SessionRepository(),
    new UserRepository()
  );

  const validateSessionUseCase = new ValidateSessionUseCase(
    new SessionRepository()
  );

  const updateActivityUseCase = new UpdateSessionActivityUseCase(
    new SessionRepository()
  );

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

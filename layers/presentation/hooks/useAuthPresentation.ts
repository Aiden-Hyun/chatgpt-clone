// Presentation layer hook for authentication
import { useCallback, useEffect, useState } from 'react';
import { AuthenticateUserUseCase } from '../../business/usecases';
import { SupabaseAuthService } from '../../persistence/adapters';
import { Session } from '../../business/interfaces/IAuthService';

interface UseAuthPresentationProps {
  onAuthSuccess?: (session: Session) => void;
  onAuthError?: (error: string) => void;
}

export interface AuthPresentationState {
  // Data
  session: Session | null;
  loading: boolean;
  initialLoading: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Status
  error?: string;
}

/**
 * Presentation hook for authentication
 * Connects auth UI to business layer
 */
export const useAuthPresentation = ({
  onAuthSuccess,
  onAuthError
}: UseAuthPresentationProps = {}): AuthPresentationState => {
  // State
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Use cases (in a real app, these would be injected via DI)
  const authService = new SupabaseAuthService();
  const authenticateUserUseCase = new AuthenticateUserUseCase(authService);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = useCallback(async () => {
    try {
      const existingSession = await authService.getCurrentSession();
      setSession(existingSession);
      
      if (existingSession && onAuthSuccess) {
        onAuthSuccess(existingSession);
      }
    } catch (err) {
      console.error('Failed to check existing session:', err);
      // Don't set error for initial session check
    } finally {
      setInitialLoading(false);
    }
  }, [onAuthSuccess]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await authenticateUserUseCase.signIn({ email, password });
      
      if (result.success) {
        const newSession: Session = {
          user: result.user,
          accessToken: result.session.accessToken,
          expiresAt: result.session.expiresAt
        };
        
        setSession(newSession);
        
        if (onAuthSuccess) {
          onAuthSuccess(newSession);
        }
      } else {
        setError(result.error);
        if (onAuthError) {
          onAuthError(result.error || 'Sign in failed');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      if (onAuthError) {
        onAuthError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [onAuthSuccess, onAuthError]);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await authenticateUserUseCase.signUp({ email, password });
      
      if (result.success) {
        const newSession: Session = {
          user: result.user,
          accessToken: result.session.accessToken,
          expiresAt: result.session.expiresAt
        };
        
        setSession(newSession);
        
        if (onAuthSuccess) {
          onAuthSuccess(newSession);
        }
      } else {
        setError(result.error);
        if (onAuthError) {
          onAuthError(result.error || 'Sign up failed');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      if (onAuthError) {
        onAuthError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [onAuthSuccess, onAuthError]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await authenticateUserUseCase.signOut();
      
      if (result.success) {
        setSession(null);
      } else {
        setError(result.error);
        if (onAuthError) {
          onAuthError(result.error || 'Sign out failed');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      if (onAuthError) {
        onAuthError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(undefined);
    
    try {
      await authService.resetPassword(email);
      // Success - no error means the reset email was sent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      if (onAuthError) {
        onAuthError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  return {
    // Data
    session,
    loading,
    initialLoading,
    
    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    
    // Status
    error
  };
};

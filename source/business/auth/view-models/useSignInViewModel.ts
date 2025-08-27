import { useCallback, useState } from 'react';
import { SignInUseCase } from '../use-cases/SignInUseCase';

export function useSignInViewModel(signInUseCase: SignInUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInUseCase.execute({ email, password });
      
      if (result.success) {
        return { success: true, user: result.user, session: result.session };
      } else {
        setError(result.error || 'Sign in failed');
        return { 
          success: false, 
          error: result.error,
          isNetworkError: result.isNetworkError 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signInUseCase]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    signIn, 
    isLoading, 
    error, 
    clearError 
  };
}

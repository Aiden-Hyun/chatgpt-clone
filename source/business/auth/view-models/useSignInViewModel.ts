import { useCallback, useState } from 'react';

import { SignInUseCase } from '../use-cases/SignInUseCase';

export function useSignInViewModel(signInUseCase: SignInUseCase) {
  console.log('🔐 [useSignInViewModel] Hook called');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log('🔐 [useSignInViewModel] Initial state:', { isLoading, error });

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 [useSignInViewModel] signIn called:', { email, passwordLength: password.length });
    setIsLoading(true);
    setError(null);
    console.log('🔐 [useSignInViewModel] State updated:', { isLoading: true, error: null });

    try {
      console.log('🔐 [useSignInViewModel] Executing use case');
      const result = await signInUseCase.execute({ email, password });
      console.log('🔐 [useSignInViewModel] Use case result:', { 
        success: result.success, 
        hasUser: !!result.user, 
        hasSession: !!result.session,
        error: result.error
      });
      
      if (result.success) {
        console.log('🔐 [useSignInViewModel] Sign in successful');
        return { success: true, user: result.user, session: result.session };
      } else {
        console.log('🔐 [useSignInViewModel] Sign in failed:', result.error);
        setError(result.error || 'Sign in failed');
        return { 
          success: false, 
          error: result.error,
          isNetworkError: result.isNetworkError 
        };
      }
    } catch (error) {
      console.error('🔐 [useSignInViewModel] Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      console.log('🔐 [useSignInViewModel] Resetting loading state');
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

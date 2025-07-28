import { useCallback } from 'react';
import { AppError } from './useErrorState';

interface UseErrorCreatorsOptions {
  setError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
}

/**
 * Hook for creating type-specific errors
 * Provides utility functions for creating different types of errors
 */
export const useErrorCreators = ({ setError }: UseErrorCreatorsOptions) => {
  // Create error from exception
  const setErrorFromException = useCallback((exception: any, type: AppError['type'] = 'general') => {
    const message = exception?.message || 'An unexpected error occurred';
    setError({ message, type, details: exception });
  }, [setError]);

  // Create network error
  const setNetworkError = useCallback((message: string, details?: any) => {
    setError({ message, type: 'network', details });
  }, [setError]);

  // Create auth error
  const setAuthError = useCallback((message: string, details?: any) => {
    setError({ message, type: 'auth', details });
  }, [setError]);

  // Create API error
  const setApiError = useCallback((message: string, details?: any) => {
    setError({ message, type: 'api', details });
  }, [setError]);

  // Create validation error
  const setValidationError = useCallback((message: string, details?: any) => {
    setError({ message, type: 'validation', details });
  }, [setError]);

  return {
    setErrorFromException,
    setNetworkError,
    setAuthError,
    setApiError,
    setValidationError,
  };
}; 
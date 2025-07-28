import { useCallback, useState } from 'react';

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'auth' | 'validation' | 'api' | 'general';
  timestamp: number;
  details?: any;
}

/**
 * Core hook for managing error states
 * Provides basic error state management and CRUD operations
 */
export const useErrorState = () => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  // Set a new error
  const setError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, newError]);
    setCurrentError(newError);
  }, []);

  // Clear a specific error
  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
    setCurrentError(prev => prev?.id === errorId ? null : prev);
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setCurrentError(null);
  }, []);

  // Update current error
  const setCurrentErrorDirectly = useCallback((error: AppError | null) => {
    setCurrentError(error);
  }, []);

  return {
    // State
    errors,
    currentError,
    
    // Actions
    setError,
    clearError,
    clearAllErrors,
    setCurrentError: setCurrentErrorDirectly,
    
    // Helpers
    hasErrors: errors.length > 0,
    errorCount: errors.length,
  };
}; 
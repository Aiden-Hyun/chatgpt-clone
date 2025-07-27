import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'auth' | 'validation' | 'api' | 'general';
  timestamp: number;
  details?: any;
}

interface UseErrorStateOptions {
  autoClear?: boolean;
  autoClearDelay?: number;
  showAlerts?: boolean;
  logToConsole?: boolean;
}

/**
 * Hook for managing error states with consistent handling
 * Provides error state management and utility functions
 */
export const useErrorState = (options: UseErrorStateOptions = {}) => {
  const { 
    autoClear = true, 
    autoClearDelay = 5000,
    showAlerts = true,
    logToConsole = true
  } = options;
  
  const [errors, setErrors] = useState<AppError[]>([]);
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  // Auto-clear errors after delay
  useEffect(() => {
    if (!autoClear || !currentError) return;

    const timer = setTimeout(() => {
      clearError(currentError.id);
    }, autoClearDelay);

    return () => clearTimeout(timer);
  }, [currentError, autoClear, autoClearDelay]);

  // Set a new error
  const setError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, newError]);
    setCurrentError(newError);

    // Log to console if enabled
    if (logToConsole) {
      console.error(`[${error.type.toUpperCase()}] ${error.message}`, error.details);
    }

    // Show alert if enabled
    if (showAlerts) {
      Alert.alert(
        'Error',
        error.message,
        [{ text: 'OK', onPress: () => clearError(newError.id) }]
      );
    }
  }, [logToConsole, showAlerts]);

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
    // State
    errors,
    currentError,
    
    // Actions
    setError,
    clearError,
    clearAllErrors,
    
    // Utility functions
    setErrorFromException,
    setNetworkError,
    setAuthError,
    setApiError,
    setValidationError,
    
    // Helpers
    hasErrors: errors.length > 0,
    errorCount: errors.length,
  };
}; 
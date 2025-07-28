import { useErrorCreators } from './useErrorCreators';
import { useErrorLogging } from './useErrorLogging';
import { AppError, useErrorState } from './useErrorState';
import { useErrorUI } from './useErrorUI';

interface UseErrorStateCombinedOptions {
  autoClear?: boolean;
  autoClearDelay?: number;
  showAlerts?: boolean;
  logToConsole?: boolean;
  externalLogger?: (error: AppError) => void;
}

/**
 * Combined error state hook that provides backward compatibility
 * Combines all error-related functionality into a single interface
 */
export const useErrorStateCombined = (options: UseErrorStateCombinedOptions = {}) => {
  const { 
    autoClear = true, 
    autoClearDelay = 5000,
    showAlerts = true,
    logToConsole = true,
    externalLogger
  } = options;

  // Core error state
  const errorState = useErrorState();
  const { setError, clearError, currentError } = errorState;

  // Error creators
  const errorCreators = useErrorCreators({ setError });

  // Error UI
  const errorUI = useErrorUI({
    autoClear,
    autoClearDelay,
    showAlerts,
    currentError,
    clearError,
  });

  // Error logging
  const errorLogging = useErrorLogging({
    logToConsole,
    externalLogger,
  });

  // Enhanced setError that includes logging and UI
  const setErrorWithLogging = (error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setError(error);
    errorLogging.logError(newError);
    errorUI.showErrorAlert(newError);
  };

  return {
    // State
    ...errorState,
    
    // Actions
    setError: setErrorWithLogging,
    clearError,
    clearAllErrors: errorState.clearAllErrors,
    
    // Utility functions
    ...errorCreators,
    
    // UI functions
    ...errorUI,
    
    // Logging functions
    ...errorLogging,
  };
}; 
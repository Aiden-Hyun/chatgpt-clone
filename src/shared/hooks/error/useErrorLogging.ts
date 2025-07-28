import { useCallback } from 'react';
import { AppError } from './useErrorState';

interface UseErrorLoggingOptions {
  logToConsole?: boolean;
  externalLogger?: (error: AppError) => void;
}

/**
 * Hook for managing error logging
 * Handles console logging and external logging integration
 */
export const useErrorLogging = (options: UseErrorLoggingOptions = {}) => {
  const { 
    logToConsole = true,
    externalLogger
  } = options;

  // Log error to console
  const logToConsoleError = useCallback((error: AppError) => {
    if (!logToConsole) return;

    console.error(`[${error.type.toUpperCase()}] ${error.message}`, error.details);
  }, [logToConsole]);

  // Log error to external service
  const logToExternal = useCallback((error: AppError) => {
    if (!externalLogger) return;

    try {
      externalLogger(error);
    } catch (loggingError) {
      // Fallback to console if external logging fails
      console.error('Failed to log to external service:', loggingError);
      logToConsoleError(error);
    }
  }, [externalLogger, logToConsoleError]);

  // Log error to all configured destinations
  const logError = useCallback((error: AppError) => {
    logToConsoleError(error);
    logToExternal(error);
  }, [logToConsoleError, logToExternal]);

  // Log error with custom formatting
  const logErrorWithContext = useCallback((error: AppError, context?: Record<string, any>) => {
    const errorWithContext = {
      ...error,
      context,
      loggedAt: new Date().toISOString(),
    };

    logError(errorWithContext);
  }, [logError]);

  return {
    logError,
    logErrorWithContext,
    logToConsoleError,
    logToExternal,
  };
}; 
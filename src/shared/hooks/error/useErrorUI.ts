import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { AppError } from './useErrorState';

interface UseErrorUIOptions {
  autoClear?: boolean;
  autoClearDelay?: number;
  showAlerts?: boolean;
  currentError: AppError | null;
  clearError: (errorId: string) => void;
}

/**
 * Hook for managing error UI interactions
 * Handles alert display and auto-clear timers
 */
export const useErrorUI = (options: UseErrorUIOptions) => {
  const { 
    autoClear = true, 
    autoClearDelay = 5000,
    showAlerts = true,
    currentError,
    clearError
  } = options;

  // Auto-clear errors after delay
  useEffect(() => {
    if (!autoClear || !currentError) return;

    const timer = setTimeout(() => {
      clearError(currentError.id);
    }, autoClearDelay);

    return () => clearTimeout(timer);
  }, [currentError, autoClear, autoClearDelay, clearError]);

  // Show alert for error
  const showErrorAlert = useCallback((error: AppError) => {
    if (!showAlerts) return;

    Alert.alert(
      'Error',
      error.message,
      [{ text: 'OK', onPress: () => clearError(error.id) }]
    );
  }, [showAlerts, clearError]);

  // Show custom alert
  const showCustomAlert = useCallback((title: string, message: string, onPress?: () => void) => {
    if (!showAlerts) return;

    Alert.alert(
      title,
      message,
      [{ text: 'OK', onPress }]
    );
  }, [showAlerts]);

  return {
    showErrorAlert,
    showCustomAlert,
  };
}; 
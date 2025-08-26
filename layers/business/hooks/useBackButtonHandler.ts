import { useCallback, useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

type BackButtonHandler = () => boolean;

interface UseBackButtonHandlerOptions {
  enabled?: boolean;
  customHandler?: BackButtonHandler;
}

/**
 * Hook for managing Android back button behavior
 * Provides functions to disable or customize back button handling
 */
export const useBackButtonHandler = (options: UseBackButtonHandlerOptions = {}) => {
  const { enabled = true, customHandler } = options;

  /**
   * Disables the Android back button
   * Returns cleanup function (no-op on non-Android platforms)
   */
  const disableBackButton = useCallback(() => {
    if (Platform.OS !== 'android') {
      return () => {}; // Return no-op cleanup for non-Android platforms
    }
    
    const onBackPress = () => true; // Prevent default back behavior
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
    return () => subscription.remove();
  }, []);

  /**
   * Sets a custom back button handler
   * @param handler - Function that returns true to prevent default, false to allow
   */
  const setBackButtonHandler = useCallback((handler: BackButtonHandler) => {
    if (Platform.OS !== 'android') {
      return () => {}; // Return no-op cleanup for non-Android platforms
    }
    
    const subscription = BackHandler.addEventListener('hardwareBackPress', handler);
    
    return () => subscription.remove();
  }, []);

  /**
   * Enables default back button behavior
   */
  const enableBackButton = useCallback(() => {
    if (Platform.OS !== 'android') {
      return () => {}; // Return no-op cleanup for non-Android platforms
    }
    
    const onBackPress = () => false; // Allow default back button behavior
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
    return () => subscription.remove();
  }, []);

  // Auto-disable back button if enabled and no custom handler
  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;
    
    if (customHandler) {
      const cleanup = setBackButtonHandler(customHandler);
      return cleanup;
    } else {
      const cleanup = disableBackButton();
      return cleanup;
    }
  }, [enabled, customHandler, disableBackButton, setBackButtonHandler]);

  return {
    disableBackButton,
    setBackButtonHandler,
    enableBackButton,
  };
}; 
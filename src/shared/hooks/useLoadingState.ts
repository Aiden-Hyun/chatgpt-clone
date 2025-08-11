import { useCallback, useState } from 'react';
import { useAppTheme } from '../../features/theme/lib/theme';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
}

/**
 * Hook for managing loading states with consistent UI
 * Provides loading state management and utility functions
 */
export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const { initialLoading = false } = options;
  
  const [loading, setLoading] = useState(initialLoading);
  const theme = useAppTheme();

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const toggleLoading = useCallback(() => {
    setLoading(prev => !prev);
  }, []);

  // Helper function to get loading styles
  const getLoadingStyles = useCallback(() => ({
    container: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.xxl,
    },
    spinnerColor: theme.colors.primary,
  }), [theme.colors.background.primary, theme.colors.primary, theme.spacing.xxl]);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    getLoadingStyles,
  };
}; 
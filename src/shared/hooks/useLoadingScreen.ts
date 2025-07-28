import { useLoadingState } from './useLoadingState';

interface UseLoadingScreenOptions {
  initialLoading?: boolean;
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

/**
 * Hook that provides loading state management with consistent options
 * Can be used with LoadingScreen or LoadingWrapper components
 */
export const useLoadingScreen = (options: UseLoadingScreenOptions = {}) => {
  const { 
    initialLoading = false, 
    message,
    size = 'large',
    fullScreen = true 
  } = options;

  const { loading, setLoading, startLoading, stopLoading } = useLoadingState({ 
    initialLoading 
  });

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    message,
    size,
    fullScreen,
  };
}; 
import { useCallback, useState } from "react";

import { errorHandler } from "../services/error";

interface UseLoadingStateOptions {
  initialLoading?: boolean;
}

/**
 * Simple hook for managing loading states with consistent error handling
 * Provides basic loading state management and utility functions
 */
export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const { initialLoading = false } = options;

  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  // Simple async wrapper with error handling
  const executeWithLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void;
        onError?: (error: Error) => void;
      }
    ): Promise<T | null> => {
      try {
        startLoading();
        const result = await operation();
        stopLoading();
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";

        // Use unified error handling system
        await errorHandler.handle(error, {
          operation: "executeWithLoading",
          service: "loading",
          component: "useLoadingState",
        });

        setErrorState(errorMessage);
        options?.onError?.(error as Error);
        return null;
      }
    },
    [startLoading, stopLoading, setErrorState]
  );

  return {
    loading,
    error,
    setLoading,
    startLoading,
    stopLoading,
    setError: setErrorState,
    executeWithLoading,
  };
};

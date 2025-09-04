import { useCallback, useState } from 'react';

/**
 * Generic hook factory for authentication operations
 * Provides consistent loading state, error handling, and return structure
 */
interface AuthOperationConfig<TParams, TResult> {
  operation: (params: TParams) => Promise<TResult>;
  loadingStateName?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
  enableNetworkErrorDetection?: boolean;
}

interface AuthOperationResult<TResult> {
  success: boolean;
  data: TResult | null;
  error: string | null;
  isNetworkError?: boolean;
}

/**
 * Detects if an error is network-related
 */
const detectNetworkError = (errorMessage: string): { error: string; isNetworkError: boolean } => {
  const networkKeywords = ['network', 'fetch', 'connection', 'timeout'];
  const isNetworkError = networkKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword)
  ) || !navigator.onLine;
  
  return {
    error: errorMessage,
    isNetworkError
  };
};

/**
 * Generic hook for authentication operations
 * Provides consistent loading state, error handling, and return structure
 */
export const useAuthOperation = <TParams, TResult>(
  config: AuthOperationConfig<TParams, TResult>
) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const execute = useCallback(async (params: TParams): Promise<AuthOperationResult<TResult>> => {
    try {
      setIsLoading(true);
      const result = await config.operation(params);
      config.onSuccess?.(result);
      return { success: true, data: result, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      let processedError: string;
      let isNetworkError = false;
      
      if (config.enableNetworkErrorDetection) {
        const networkResult = detectNetworkError(errorMessage);
        processedError = networkResult.error;
        isNetworkError = networkResult.isNetworkError;
      } else {
        processedError = errorMessage;
      }
      
      config.onError?.(error as Error);
      return { 
        success: false, 
        data: null, 
        error: processedError,
        ...(config.enableNetworkErrorDetection && { isNetworkError })
      };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  return { 
    execute, 
    isLoading,
    loadingStateName: config.loadingStateName || 'isLoading'
  };
};

/**
 * Specialized hook for operations that don't return data (like logout, password reset)
 */
export const useAuthOperationVoid = <TParams>(
  config: Omit<AuthOperationConfig<TParams, void>, 'operation'> & {
    operation: (params: TParams) => Promise<void>;
  }
) => {
  const { execute, isLoading, loadingStateName } = useAuthOperation({
    ...config,
    operation: async (params: TParams) => {
      await config.operation(params);
      return undefined as void;
    }
  });

  return { execute, isLoading, loadingStateName };
};

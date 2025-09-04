import { useCallback, useState } from "react";

import { errorHandler } from "../../../shared/services/error";

/**
 * Generic hook factory for authentication operations
 * Provides consistent loading state, error handling, and return structure
 * Now integrated with unified error handling system
 */
interface AuthOperationConfig<TParams, TResult> {
  operation: (params: TParams) => Promise<TResult>;
  loadingStateName?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
  enableNetworkErrorDetection?: boolean;
  operationName?: string; // For better error context
}

interface AuthOperationResult<TResult> {
  success: boolean;
  data: TResult | null;
  error: string | null;
  isNetworkError?: boolean;
  errorCode?: string; // Add error code from unified system
}

/**
 * Generic hook for authentication operations
 * Provides consistent loading state, error handling, and return structure
 */
export const useAuthOperation = <TParams, TResult>(
  config: AuthOperationConfig<TParams, TResult>
) => {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (params: TParams): Promise<AuthOperationResult<TResult>> => {
      try {
        setIsLoading(true);
        const result = await config.operation(params);
        config.onSuccess?.(result);
        return { success: true, data: result, error: null };
      } catch (error) {
        // Use unified error handling system
        const processedError = await errorHandler.handle(error, {
          operation: config.operationName || "authOperation",
          service: "auth",
          component: "useAuthOperation",
          metadata: {
            params:
              typeof params === "object" ? { ...params } : { value: params },
          },
        });

        // Call the original error callback if provided
        config.onError?.(error as Error);

        return {
          success: false,
          data: null,
          error: processedError.userMessage,
          errorCode: processedError.code,
          isNetworkError:
            processedError.code.includes("NETWORK") ||
            processedError.code.includes("TIMEOUT"),
        };
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  return {
    execute,
    isLoading,
    loadingStateName: config.loadingStateName || "isLoading",
  };
};

/**
 * Specialized hook for operations that don't return data (like logout, password reset)
 */
export const useAuthOperationVoid = <TParams>(
  config: Omit<AuthOperationConfig<TParams, void>, "operation"> & {
    operation: (params: TParams) => Promise<void>;
  }
) => {
  const { execute, isLoading, loadingStateName } = useAuthOperation({
    ...config,
    operation: async (params: TParams) => {
      await config.operation(params);
      return undefined as void;
    },
  });

  return { execute, isLoading, loadingStateName };
};

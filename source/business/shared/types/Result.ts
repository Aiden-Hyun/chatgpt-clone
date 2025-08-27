// Standard Result pattern for consistent error handling
// Follows Railway Oriented Programming principles

export interface Success<T> {
  success: true;
  data: T;
  error?: never;
  isNetworkError?: never;
}

export interface Failure {
  success: false;
  data?: never;
  error: string;
  isNetworkError?: boolean;
}

export type Result<T> = Success<T> | Failure;

// Helper functions for creating results
export const createSuccess = <T>(data: T): Success<T> => ({
  success: true,
  data
});

export const createFailure = (error: string, isNetworkError?: boolean): Failure => ({
  success: false,
  error,
  isNetworkError
});

// Type guards
export const isSuccess = <T>(result: Result<T>): result is Success<T> => {
  return result.success === true;
};

export const isFailure = <T>(result: Result<T>): result is Failure => {
  return result.success === false;
};

// Async Result utilities
export type AsyncResult<T> = Promise<Result<T>>;

// Convert from existing patterns
export const fromLegacyResult = <T>(
  legacyResult: { success: boolean; data?: T; error?: string; isNetworkError?: boolean }
): Result<T> => {
  if (legacyResult.success && legacyResult.data !== undefined) {
    return createSuccess(legacyResult.data);
  } else {
    return createFailure(
      legacyResult.error || 'Unknown error',
      legacyResult.isNetworkError
    );
  }
};

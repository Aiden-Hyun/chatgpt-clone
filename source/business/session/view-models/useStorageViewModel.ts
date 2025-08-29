import { useState, useCallback } from 'react';
import { ClearStorageUseCase } from '../use-cases/ClearStorageUseCase';
import { GetStoredRouteUseCase } from '../../navigation/use-cases/GetStoredRouteUseCase';
import { SetStoredRouteUseCase } from '../../navigation/use-cases/SetStoredRouteUseCase';
import { ClearStorageParams, GetStoredRouteParams, SetStoredRouteParams } from '../../interfaces';

export function useStorageViewModel(
  clearStorageUseCase: ClearStorageUseCase,
  getStoredRouteUseCase: GetStoredRouteUseCase,
  setStoredRouteUseCase: SetStoredRouteUseCase
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearStorage = useCallback(async (storageType: 'local' | 'secure' | 'all') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await clearStorageUseCase.execute({ storageType });
      
      if (result.success) {
        return { success: true, clearedKeys: result.clearedKeys };
      } else {
        setError(result.error || 'Failed to clear storage');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear storage';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [clearStorageUseCase]);

  const getStoredRoute = useCallback(async (key: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getStoredRouteUseCase.execute({ key });
      
      if (result.success) {
        return { success: true, route: result.route };
      } else {
        setError(result.error || 'Failed to get stored route');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get stored route';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getStoredRouteUseCase]);

  const setStoredRoute = useCallback(async (key: string, route: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await setStoredRouteUseCase.execute({ key, route });
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || 'Failed to set stored route');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set stored route';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [setStoredRouteUseCase]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearStorage,
    getStoredRoute,
    setStoredRoute,
    clearError
  };
}

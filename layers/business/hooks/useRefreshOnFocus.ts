import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

/**
 * Hook for refreshing data when screen comes into focus
 * Wraps useFocusEffect with useCallback for optimal performance
 */
export const useRefreshOnFocus = (
  refreshFunction: () => void,
  dependencies: React.DependencyList = []
) => {
  useFocusEffect(
    useCallback(() => {
      refreshFunction();
    }, dependencies)
  );
}; 
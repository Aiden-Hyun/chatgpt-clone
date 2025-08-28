import { useState } from 'react';

/**
 * A hook to manage loading states
 * @returns Object with loading state and functions to control it
 */
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Set loading state to true
   */
  const startLoading = () => {
    setIsLoading(true);
  };

  /**
   * Set loading state to false
   */
  const stopLoading = () => {
    setIsLoading(false);
  };

  /**
   * Toggle loading state
   */
  const toggleLoading = () => {
    setIsLoading(prev => !prev);
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading,
  };
};

export default useLoadingState;

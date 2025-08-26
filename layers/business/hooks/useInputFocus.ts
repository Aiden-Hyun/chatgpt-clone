import { useCallback, useRef } from 'react';
import { TextInput } from 'react-native';

interface UseInputFocusOptions {
  focusDelay?: number;
}

/**
 * Hook for managing input field focus
 * Provides a ref and function to maintain focus after actions
 */
export const useInputFocus = (options: UseInputFocusOptions = {}) => {
  const { focusDelay = 50 } = options;
  const inputRef = useRef<TextInput | null>(null);

  /**
   * Maintains focus on the input field after a specified delay
   * Useful for keeping focus after sending messages or other actions
   */
  const maintainFocus = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, focusDelay);
  }, [focusDelay]);

  /**
   * Immediately focuses the input field
   */
  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Blurs the input field
   */
  const blur = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  return {
    inputRef,
    maintainFocus,
    focus,
    blur,
  };
}; 
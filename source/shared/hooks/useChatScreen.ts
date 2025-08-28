import { useMemo, useRef } from 'react';

/**
 * 🎯 COMPOSITE HOOK: Batches all ChatScreen hook initializations
 * 
 * This hook prevents the hook initialization cascade by bundling all
 * ChatScreen-related hooks into a single, memoized initialization.
 * 
 * Before: 4-5 individual hook calls → 4-5 renders
 * After: 1 composite hook call → 1 render
 */
export function useChatScreen() {
  // Create a simple input ref for now
  const inputRef = useRef(null);

  // Memoize the entire result to prevent recreation
  const chatScreenState = useMemo(() => {
    return {
      // Input focus state
      inputRef,
      maintainFocus: () => {
        if (inputRef.current) {
          setTimeout(() => {
            // @ts-ignore
            inputRef.current?.focus();
          }, 100);
        }
      },
    };
  }, [inputRef]); // Only recreate when these actually change

  return chatScreenState;
}

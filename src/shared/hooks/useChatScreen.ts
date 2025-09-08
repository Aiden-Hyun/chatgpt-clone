import { useMemo } from "react";

import { useBackButtonHandler, useInputFocus } from "./index";

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
  // Initialize all hooks together
  const inputFocus = useInputFocus();
  const backButton = useBackButtonHandler({ enabled: true });

  // Memoize the entire result to prevent recreation
  const chatScreenState = useMemo(() => {
    return {
      // Input focus state
      inputRef: inputFocus.inputRef,
      maintainFocus: inputFocus.maintainFocus,

      // Back button state
      disableBackButton: backButton.disableBackButton,
    };
  }, [
    inputFocus.inputRef,
    inputFocus.maintainFocus,
    backButton.disableBackButton,
  ]); // Only recreate when these actually change

  return chatScreenState;
}

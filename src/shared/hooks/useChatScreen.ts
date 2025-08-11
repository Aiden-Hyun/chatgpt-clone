import { useMemo } from 'react';
import { createChatStyles } from '../../../app/chat/chat.styles';
import { useChatRooms } from '../../features/chat/hooks';
import { useAppTheme } from '../../features/theme/lib/theme';
import { useBackButtonHandler, useInputFocus } from './index';

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
  if (__DEV__) {
    console.log('🎯 [COMPOSITE-HOOK] useChatScreen initializing all hooks together');
  }

  // Initialize all hooks together
  const inputFocus = useInputFocus();
  const backButton = useBackButtonHandler({ enabled: true });
  const chatRooms = useChatRooms();
  const theme = useAppTheme();

  // Memoize individual hook results to prevent identity changes
  const stableInputRef = useMemo(() => inputFocus.inputRef, [inputFocus.inputRef]);
  const stableMaintainFocus = useMemo(() => inputFocus.maintainFocus, [inputFocus.maintainFocus]);
  const stableDisableBackButton = useMemo(() => backButton.disableBackButton, [backButton.disableBackButton]);
  const stableStartNewChat = useMemo(() => chatRooms.startNewChat, [chatRooms.startNewChat]);
  const stableStyles = useMemo(() => createChatStyles(theme), [theme]);

  // Memoize the entire result to prevent recreation
  const chatScreenState = useMemo(() => {
    if (__DEV__) {
      console.log('🎯 [COMPOSITE-HOOK] State memoization triggered', {
        hasInputRef: !!stableInputRef,
        hasTheme: !!theme,
        hasStyles: !!stableStyles,
        note: 'All hooks initialized together with stable references'
      });
    }

    return {
      // Input focus state
      inputRef: stableInputRef,
      maintainFocus: stableMaintainFocus,
      
      // Back button state
      disableBackButton: stableDisableBackButton,
      
      // Chat rooms state
      startNewChat: stableStartNewChat,
      
      // Theme and styles
      theme,
      styles: stableStyles,
    };
  }, [
    stableInputRef,
    stableMaintainFocus,
    stableDisableBackButton,
    stableStartNewChat,
    theme,
    stableStyles,
  ]); // Only recreate when these actually change

  return chatScreenState;
}

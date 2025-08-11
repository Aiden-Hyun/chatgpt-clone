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

  // Memoize the entire result to prevent recreation
  const chatScreenState = useMemo(() => {
    const styles = createChatStyles(theme);
    
    if (__DEV__) {
      console.log('🎯 [COMPOSITE-HOOK] State memoization triggered', {
        hasInputRef: !!inputFocus.inputRef,
        hasTheme: !!theme,
        hasStyles: !!styles,
        note: 'All hooks initialized together in single render'
      });
    }

    return {
      // Input focus state
      inputRef: inputFocus.inputRef,
      maintainFocus: inputFocus.maintainFocus,
      
      // Back button state
      disableBackButton: backButton.disableBackButton,
      
      // Chat rooms state
      startNewChat: chatRooms.startNewChat,
      
      // Theme and styles
      theme,
      styles,
    };
  }, [
    inputFocus.inputRef,
    inputFocus.maintainFocus,
    backButton.disableBackButton,
    chatRooms.startNewChat,
    theme,
  ]); // Only recreate when these actually change

  return chatScreenState;
}

import { StyleSheet } from 'react-native';

import { PresentationTheme } from '../../interfaces/theme';

export const createChatStyles = (theme: PresentationTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    // Add any other chat-specific styles here
  });
};

export default createChatStyles;
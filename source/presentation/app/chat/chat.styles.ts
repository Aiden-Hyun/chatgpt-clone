import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../presentation/theme/theme.types';

export const createChatStyles = (theme: AppTheme) => {
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
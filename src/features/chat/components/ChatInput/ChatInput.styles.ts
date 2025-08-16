import { Platform, StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

/**
 * ChatInput Styles
 * Dedicated style file for ChatInput component
 */
export const createChatInputStyles = (isInputFocused: boolean, theme: AppTheme) => {
  
  const styles = StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg + 10 : theme.spacing.lg, // Extra padding for iOS
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      ...theme.shadows.medium,
    },
    inputContainer: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    input: {
      textAlignVertical: 'top',
      maxHeight: 120,
      minHeight: 44,
    },
    sendButton: {
      minWidth: 80,
    },
  });

  return {
    styles,
  };
}; 
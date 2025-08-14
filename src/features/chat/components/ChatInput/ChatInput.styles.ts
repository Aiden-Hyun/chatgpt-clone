import { Platform, StyleSheet } from 'react-native';

/**
 * ChatInput Styles
 * Dedicated style file for ChatInput component
 */
export const createChatInputStyles = (isInputFocused: boolean, theme: any) => {
  
  const styles = StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg + 10 : theme.spacing.lg, // Extra padding for iOS
      alignItems: 'flex-end',
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      ...theme.shadows.medium,
    },
    input: {
      flex: 1,
      textAlignVertical: 'top',
      borderColor: isInputFocused 
        ? theme.colors.status.info.border
        : theme.colors.border.medium,
      borderWidth: 1.5,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      marginRight: theme.spacing.md,
      fontSize: theme.fontSizes.md,
      backgroundColor: theme.colors.background.primary,
      color: theme.colors.text.primary,
      maxHeight: 120,
      minHeight: 44,
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.normal,
    },
    inputFocused: {
      borderColor: theme.colors.status.info.primary,
      borderWidth: 2,
      backgroundColor: theme.colors.status.info.background,
    },
    sendButton: {
      backgroundColor: theme.colors.status.success.primary,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      ...theme.shadows.medium,
      minWidth: 80,
      alignItems: 'center',
    },
    sendButtonHover: {
      backgroundColor: theme.colors.status.success.secondary,
      ...theme.shadows.heavy,
    },
    sendButtonPressed: {
      backgroundColor: theme.colors.status.success.tertiary,
      transform: [{ scale: 0.98 }],
    },
    sendButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.wide,
    },
    disabledButton: {
      backgroundColor: theme.colors.interactive.disabled.primary,
      opacity: 0.6,
    },
    disabledButtonText: {
      color: theme.colors.interactive.disabled.primary,
    },
  });

  return {
    styles,
    placeholderTextColor: theme.colors.text.quaternary,
  };
}; 
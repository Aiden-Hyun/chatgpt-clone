import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../src/shared/hooks';

// Note: This file now exports a function that returns styles based on the current theme
// Components should use this function instead of importing styles directly

export const createChatStyles = () => {
  const theme = useAppTheme();
  
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: theme.colors.background.primary 
    },
    center: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary
    },
    header: { 
      padding: theme.spacing.lg, 
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      ...theme.shadows.light,
    },
    logout: { 
      alignItems: 'flex-end',
    },
    modelSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    modelLabel: {
      fontSize: theme.fontSizes.sm,
      marginRight: theme.spacing.sm,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.status.info.primary, // Enhanced: Using info primary for model label
    },
    picker: {
      width: 150,
      height: 30,
    },
    pickerItem: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fontFamily.primary,
    },
    messageBubble: {
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xs,
      maxWidth: '85%',
      ...theme.shadows.medium,
    },
    inputRow: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      alignItems: 'flex-end',
      backgroundColor: theme.colors.background.primary,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      ...theme.shadows.medium,
    },
    input: {
      flex: 1,
      borderColor: theme.colors.border.medium,
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
      letterSpacing: theme.letterSpacing.normal
    },
    messagesList: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      flexGrow: 1,
    },
    sendButton: {
      backgroundColor: theme.colors.status.success.primary, // Enhanced: Using success primary for send button
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      ...theme.shadows.medium,
    },
    sendButtonText: {
      color: theme.colors.text.inverted, // Enhanced: Using inverted text for contrast
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.wide
    },
    disabledButton: {
      backgroundColor: theme.colors.interactive.disabled.primary, // Enhanced: Using disabled state
      opacity: 0.6
    }
  });
};

// Legacy export for backward compatibility (deprecated)
// Components should use createChatStyles() instead
export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' // This will be overridden by the theme
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  header: { 
    padding: 16, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logout: { 
    alignItems: 'flex-end',
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modelLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  picker: {
    width: 150,
    height: 30,
  },
  pickerItem: {
    fontSize: 14,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 2,
    maxWidth: '85%',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    borderColor: '#CCCCCC',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    maxHeight: 120,
    minHeight: 44,
  },
  messagesList: {
    paddingVertical: 12,
    paddingHorizontal: 2,
    flexGrow: 1,
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6
  }
});

import { StyleSheet, Platform } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';

/**
 * ChatHeader Styles
 * Dedicated style file for ChatHeader component
 */
export const createChatHeaderStyles = () => {
  const theme = useAppTheme();
  
  return StyleSheet.create({
    header: {
      padding: theme.spacing.lg,
      paddingTop: Platform.OS === 'ios' ? theme.spacing.lg + 44 : theme.spacing.lg, // Add extra padding for iOS status bar
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      ...theme.shadows.light,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semiBold as '600',
    },
    menuButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background.secondary,
      ...theme.shadows.light,
    },
    menuButtonText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center',
    },
  });
}; 
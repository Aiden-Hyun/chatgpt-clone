import { Platform, StyleSheet } from 'react-native';

/**
 * ChatHeader Styles
 * Dedicated style file for ChatHeader component
 */
export const createChatHeaderStyles = (theme: any) => {
  
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
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      ...theme.shadows.light,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    backButtonText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semiBold as '600',
      textAlign: 'center',
      lineHeight: 24,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semiBold as '600',
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.light,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    menuButtonText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center',
      lineHeight: 24,
    },
  });
}; 
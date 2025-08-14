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
    modelSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      ...theme.shadows.light,
    },
    modelSelectorText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
      marginRight: theme.spacing.xs,
    },
    modelMenuOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    modelMenuContainer: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: Platform.OS === 'ios' ? 100 : 80,
      minWidth: 200,
      ...theme.shadows.medium,
    },
    modelListContainer: {
      maxHeight: 300,
    },
    modelMenuItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm,
      marginVertical: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedModelMenuItem: {
      backgroundColor: theme.colors.background.secondary,
    },
    modelMenuText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
    },
    selectedModelMenuText: {
      color: theme.colors.status.info.primary,
      fontWeight: theme.fontWeights.semibold as '600',
    },
    quickActionsOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
    },
    quickActionsContainer: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: 120,
      marginRight: 16,
      minWidth: 180,
      ...theme.shadows.medium,
    },
    quickActionsMenuItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm,
      marginVertical: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quickActionsMenuText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
    },
  });
}; 
import { StyleSheet } from 'react-native';
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      ...theme.shadows.light,
    },
    modelSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      backgroundColor: theme.colors.status.info.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.status.info.border,
    },
    modelLabel: {
      fontSize: theme.fontSizes.sm,
      marginRight: theme.spacing.sm,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.status.info.primary,
      fontWeight: theme.fontWeights.medium as '500',
    },
    picker: {
      width: 150,
      height: 30,
      color: theme.colors.text.primary,
    },
    pickerItem: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
    },
    logoutButton: {
      backgroundColor: theme.colors.status.error.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      ...theme.shadows.light,
    },
    logoutButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
    },
  });
}; 
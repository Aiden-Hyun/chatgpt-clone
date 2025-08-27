import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../../../layers/business/theme/theme.types';

export const createChatHeaderStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.colors.light,
      backgroundColor: theme.colors.background.primary,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md,
    },
    messageCount: {
      fontSize: 14,
      color: theme.colors.text.tertiary,
      marginLeft: theme.spacing.sm,
    },
    loadingIndicator: {
      marginLeft: theme.spacing.sm,
    },
  });
};

import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

export const createUserMessageStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    compact: {
      marginVertical: theme.spacing.xxs,
    },
    bubble: {
      backgroundColor: theme.colors.message.user,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      maxWidth: '80vw',
      minWidth: 40,
      alignSelf: 'flex-end',
      ...theme.shadows.light,
    },
    bubbleCompact: {
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
    },
    text: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.message.userText,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
    bubbleEdit: {
      backgroundColor: theme.colors.message.user,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      width: '80vw',
      alignSelf: 'flex-end',
      ...theme.shadows.light,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderWidth: 1.5,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'transparent',
    },
  });
};
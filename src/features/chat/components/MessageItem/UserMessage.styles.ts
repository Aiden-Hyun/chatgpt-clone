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
    contentContainer: {
      alignItems: 'flex-end',
    },
    bubble: {
      backgroundColor: theme.colors.message.user,
      borderRadius: theme.borders.radius.lg,
      padding: theme.spacing.md,
      //maxWidth: '80vw',
      minWidth: 40,
      alignSelf: 'flex-end',
      ...theme.shadows.light,
    },
    bubbleCompact: {
      borderTopLeftRadius: theme.borders.radius.lg,
      borderTopRightRadius: theme.borders.radius.lg,
    },
    text: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.message.userText,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
    bubbleEdit: {
      backgroundColor: theme.colors.message.user,
      borderRadius: theme.borders.radius.lg,
      padding: theme.spacing.md,
      width: '80%',
      alignSelf: 'flex-end',
      ...theme.shadows.light,
    },
    textInput: {
      color: theme.colors.message.userText,
      fontFamily: theme.typography.fontFamily.primary,
      fontSize: theme.typography.fontSizes.md,
      lineHeight: 22,
      paddingVertical: 4,
      backgroundColor: 'transparent',
      borderWidth: 0,
      outlineStyle: 'none' as any,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderWidth: theme.borders.widths.medium,
      borderRadius: theme.borders.radius.sm,
      backgroundColor: 'transparent',
    },
    buttonRow: {
      flexDirection: 'row',
      marginTop: 0,
      gap: 0,
    },
    iconButton: {
      //padding: 0,
      paddingVertical: 0,
      paddingHorizontal: 3,
    },
  });
};
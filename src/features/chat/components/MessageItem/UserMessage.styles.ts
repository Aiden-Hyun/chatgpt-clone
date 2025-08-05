import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';

export const createUserMessageStyles = () => {
  const theme = useAppTheme();
  
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
      maxWidth: '70%',
      minWidth: 40,
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
    },
  });
}; 
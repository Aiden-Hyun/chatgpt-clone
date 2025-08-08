import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';

export const createAssistantMessageStyles = () => {
  const theme = useAppTheme();
  
  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    compact: {
      marginVertical: theme.spacing.xxs,
    },
    text: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      lineHeight: 28,
      textAlign: 'left',
      fontWeight: theme.fontWeights.normal as '400',
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    cursor: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.normal as '400',
    },
  });
}; 
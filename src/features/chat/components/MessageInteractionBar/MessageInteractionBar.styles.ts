import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

export const createMessageInteractionBarStyles = (theme: AppTheme) => {
  
  return StyleSheet.create({
    container: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    iconButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      borderRadius: 16,
      backgroundColor: 'transparent',
    },
    iconText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.secondary,
    },
    scrollIndicator: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
    },
    scrollIcon: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.tertiary,
      fontWeight: theme.fontWeights.regular as '400',
    },
  });
}; 
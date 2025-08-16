import { StyleSheet } from 'react-native';
import { AppTheme } from '../../src/features/theme/theme.types';

export const createAuthStyles = (theme: AppTheme) => {
  
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      color: theme.colors.text.secondary,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
    },
    title: {
      fontSize: theme.fontSizes.xxl,
      fontWeight: theme.fontWeights.bold as '700',
      marginBottom: theme.spacing.xxl,
      textAlign: 'center',
      color: theme.colors.text.primary,
    },
    googleButton: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.medium,
    },
    googleButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold as '600',
      textAlign: 'center',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginVertical: theme.spacing.lg,
    },
    dividerText: {
      color: theme.colors.text.tertiary,
      fontSize: theme.fontSizes.md,
      marginHorizontal: theme.spacing.md,
    },
    button: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.medium,
    },
    buttonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold as '600',
      textAlign: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    linkButton: {
      marginVertical: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    },
    linkText: {
      color: theme.colors.primary,
      fontSize: theme.fontSizes.md,
      textAlign: 'center',
    },
    errorText: {
      color: theme.colors.status.error.primary,
      fontSize: theme.fontSizes.sm,
      marginTop: -theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    retryButton: {
      backgroundColor: theme.colors.status.warning.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.md,
      ...theme.shadows.light,
    },
    retryButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center',
    },
  });
};

export default createAuthStyles;

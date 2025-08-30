import { StyleSheet } from 'react-native';

import { PresentationTheme } from '../../interfaces/theme';

export const createAuthStyles = (theme: PresentationTheme) => {
  
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
      fontSize: theme.typography.fontSizes.xxl,
      fontWeight: theme.typography.fontWeights.bold as '700',
      marginBottom: theme.spacing.xxl,
      textAlign: 'center',
      color: theme.colors.text.primary,
    },
    googleButton: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borders.radius.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.medium,
    },
    googleButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold as '600',
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
      fontSize: theme.typography.fontSizes.md,
      marginHorizontal: theme.spacing.md,
    },
    button: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borders.radius.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.medium,
    },
    buttonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold as '600',
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
      fontSize: theme.typography.fontSizes.md,
      textAlign: 'center',
    },
    errorText: {
      color: theme.colors.status.error.primary,
      fontSize: theme.typography.fontSizes.sm,
      marginTop: -theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    retryButton: {
      backgroundColor: theme.colors.status.warning.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borders.radius.md,
      marginTop: theme.spacing.md,
      ...theme.shadows.light,
    },
    retryButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.medium as '500',
      textAlign: 'center',
    },
  });
};
export default createAuthStyles;
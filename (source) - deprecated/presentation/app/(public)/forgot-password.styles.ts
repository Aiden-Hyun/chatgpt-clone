import { StyleSheet } from 'react-native';

import { PresentationTheme } from '../../interfaces/theme';

export const createForgotPasswordStyles = (theme: PresentationTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.colors.light,
      backgroundColor: theme.colors.background.primary,
    },
    backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
      minWidth: theme.layout.buttonSizes.action,
      minHeight: theme.layout.buttonSizes.action,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      marginRight: theme.layout.buttonSizes.header,
    },
    title: {
      marginBottom: theme.spacing.lg,
    },
    description: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      lineHeight: 20,
    },
    button: {
      marginTop: theme.spacing.md,
    },
    linkButton: {
      marginTop: theme.spacing.md,
    },
  });
};

export default createForgotPasswordStyles;
import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../presentation/theme/theme.types';

export const createForgotPasswordStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
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
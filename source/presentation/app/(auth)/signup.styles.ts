import { StyleSheet } from 'react-native';

import { PresentationTheme } from '../../interfaces/theme';

export const createSignupStyles = (theme: PresentationTheme) => {
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
    button: {
      marginTop: theme.spacing.md,
    },
    linkButton: {
      marginTop: theme.spacing.md,
    },
  });
};

export default createSignupStyles;
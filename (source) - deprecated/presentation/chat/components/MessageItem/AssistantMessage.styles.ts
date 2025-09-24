import { StyleSheet } from 'react-native';

import { PresentationTheme } from '../../../interfaces/theme';

export const createAssistantMessageStyles = (theme: PresentationTheme) => {
  
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: 0,
      backgroundColor: 'transparent',
    },
    compact: {
      // Empty for now, can be used for compact styling if needed
    },
    text: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      lineHeight: 20,
      textAlign: 'left',
      fontWeight: theme.typography.fontWeights.regular as '400',
    },
  });
}; 
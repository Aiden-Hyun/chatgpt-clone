import { StyleSheet } from 'react-native';

import { AppTheme } from '../../../theme/theme.types';

export const createAssistantMessageStyles = (theme: AppTheme) => {
  
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
// src/features/chat/components/ErrorMessage/ErrorMessage.styles.ts
import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

export const createErrorMessageStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      marginVertical: 8,
      marginHorizontal: 16,
    },
    
    errorContent: {
      backgroundColor: theme.colors.status.error.background,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.status.error.primary,
    },
    
    errorText: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeights.medium as '500',
      color: theme.colors.status.error.primary,
      marginBottom: 4,
    },
    
    errorSubtext: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 12,
    },
    
    retryButton: {
      alignSelf: 'flex-start',
    },
  });
};

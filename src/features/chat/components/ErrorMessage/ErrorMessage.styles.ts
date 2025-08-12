// src/features/chat/components/ErrorMessage/ErrorMessage.styles.ts
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../theme/theme';

// Get the theme type from the hook
type AppTheme = ReturnType<typeof useAppTheme>;

export const createErrorMessageStyles = (theme: AppTheme) => StyleSheet.create({
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
    fontWeight: theme.fontWeights.medium as '500',
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
    backgroundColor: theme.colors.status.error.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: theme.fontWeights.medium as '500',
  },
});

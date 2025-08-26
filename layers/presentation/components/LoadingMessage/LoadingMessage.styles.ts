import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

export const createLoadingMessageStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg, // Increased horizontal padding to match AI responses
    },
    loadingText: {
      fontSize: theme.typography.fontSizes.md, // Smaller, less prominent font
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.secondary, // More subtle color
      fontWeight: theme.typography.fontWeights.regular as '400',
      marginBottom: theme.spacing.md,
      lineHeight: theme.typography.fontSizes.md * 1.4, // Proper line height for iOS
      textAlign: 'left' as const,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: theme.spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.text.tertiary,
      marginRight: theme.spacing.sm,
    },
  });
}; 
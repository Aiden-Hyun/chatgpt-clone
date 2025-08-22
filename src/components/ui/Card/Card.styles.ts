import { AppTheme } from '../../../features/theme/theme.types';
import { CardPadding, CardVariant } from './Card.types';

/**
 * Creates card styles based on the current theme
 */
export const createCardStyles = (theme: AppTheme) => {
  // Base styles for all cards
  const baseCard = {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.lg,
    overflow: 'hidden' as const,
  };

  // Padding variations
  const paddings = {
    none: {
      padding: 0,
    },
    sm: {
      padding: theme.spacing.sm,
    },
    md: {
      padding: theme.spacing.md,
    },
    lg: {
      padding: theme.spacing.lg,
    },
  };

  // Create styles for each variant
  const getVariantStyle = (variant: CardVariant) => {
    switch (variant) {
      case 'default':
        return {
          ...theme.shadows.light,
          borderWidth: 0,
        };
      case 'elevated':
        return {
          ...theme.shadows.medium,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          // No shadows for outlined cards
        };
      case 'flat':
        return {
          // No shadows or borders for flat cards
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  // Get padding style for content
  const getPaddingStyle = (padding: CardPadding) => {
    return paddings[padding];
  };

  return {
    // Base styles
    card: baseCard,
    
    // Helper functions to get specific styles
    getVariantStyle,
    getPaddingStyle,
    
    // Additional styles
    fullWidth: {
      width: '100%',
    },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    content: {
      // Content styling is handled by getPaddingStyle
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    pressableHighlight: {
      backgroundColor: theme.colors.interactive.hover.primary,
    },
  };
};

export default createCardStyles;

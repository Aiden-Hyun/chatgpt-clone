import { AppTheme } from '../../../features/theme/theme.types';
import { ListItemVariant } from './ListItem.types';

/**
 * Creates list item styles based on the current theme
 */
export const createListItemStyles = (theme: AppTheme) => {
  // Base styles for all list items
  const baseItem = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: '100%',
    backgroundColor: theme.colors.background.primary,
  };

  // Size variations
  const sizes = {
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minHeight: 48,
    },
    md: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 60,
    },
    lg: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      minHeight: 72,
    },
  };

  // Create styles for each variant
  const getVariantStyle = (variant: ListItemVariant) => {
    switch (variant) {
      case 'default':
        return {};
      case 'settings':
        return {
          backgroundColor: theme.colors.background.secondary,
        };
      case 'chat':
        return {
          backgroundColor: theme.colors.background.primary,
        };
      case 'menu':
        return {
          backgroundColor: theme.colors.background.primary,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          minHeight: 40,
        };
      default:
        return {};
    }
  };

  return {
    // Base styles
    item: baseItem,
    
    // Size variations
    sizes,
    
    // Helper functions to get specific styles
    getVariantStyle,
    
    // Content container
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    
    // Text styles
    title: {
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.medium as '500',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.primary,
    },
    subtitle: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
      marginTop: 2,
      fontFamily: theme.typography.fontFamily.primary,
    },
    description: {
      fontSize: theme.typography.fontSizes.xs,
      color: theme.colors.text.tertiary,
      marginTop: 2,
      fontFamily: theme.typography.fontFamily.primary,
    },
    
    // Element containers
    leftElementContainer: {
      marginRight: theme.spacing.md,
    },
    rightElementContainer: {
      marginLeft: theme.spacing.md,
    },
    
    // States
    selected: {
      backgroundColor: theme.colors.background.secondary,
    },
    selectedTitle: {
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeights.semibold as '600',
    },
    disabled: {
      opacity: 0.6,
    },
    pressed: {
      backgroundColor: theme.colors.interactive.hover.primary,
    },
    
    // Border
    border: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
  };
};

export default createListItemStyles;

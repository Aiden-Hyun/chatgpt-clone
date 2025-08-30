import { PresentationTheme } from '../../../interfaces/theme';

import { ButtonSize, ButtonStatus, ButtonVariant } from './Button.types';

/**
 * Creates button styles based on the current theme
 */
export const createButtonStyles = (theme: PresentationTheme) => {
  // Base styles for all buttons
  const baseButton = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: theme.borders.radius.md,
  };

  // Size variations
  const sizes = {
    xs: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      minHeight: 28,
    },
    sm: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minHeight: 36,
    },
    md: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 44,
    },
    lg: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      minHeight: 52,
    },
    xl: {
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xxl,
      minHeight: 60,
    },
  };

  // Font sizes for each button size
  const fontSizes = {
    xs: theme.typography.fontSizes.xs,
    sm: theme.typography.fontSizes.sm,
    md: theme.typography.fontSizes.md,
    lg: theme.typography.fontSizes.lg,
    xl: theme.typography.fontSizes.xl,
  };

  // Status color mappings
  const statusColors = {
    default: {
      background: theme.colors.primary,
      text: theme.colors.text.inverted,
      border: theme.colors.primary,
    },
    success: {
      background: theme.colors.status.success.primary,
      text: theme.colors.text.inverted,
      border: theme.colors.status.success.primary,
    },
    error: {
      background: theme.colors.status.error.primary,
      text: theme.colors.text.inverted,
      border: theme.colors.status.error.primary,
    },
    warning: {
      background: theme.colors.status.warning.primary,
      text: theme.colors.text.inverted,
      border: theme.colors.status.warning.primary,
    },
    info: {
      background: theme.colors.status.info.primary,
      text: theme.colors.text.inverted,
      border: theme.colors.status.info.primary,
    },
  };

  // Create styles for each variant
  const getVariantStyle = (variant: ButtonVariant, status: ButtonStatus) => {
    const colors = statusColors[status];
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.background,
          borderWidth: theme.borders.widths.none,
          ...theme.shadows.medium,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.background.secondary,
          borderWidth: theme.borders.widths.thin,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: theme.borders.widths.thin,
          borderColor: colors.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: theme.borders.widths.none,
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          borderWidth: theme.borders.widths.none,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: 0,
          minHeight: 0,
        };
      default:
        return {};
    }
  };

  // Create text styles for each variant
  const getTextStyle = (variant: ButtonVariant, status: ButtonStatus, size: ButtonSize) => {
    const colors = statusColors[status];
    const fontSize = fontSizes[size];
    
    const baseTextStyle = {
      fontSize,
      fontWeight: theme.typography.fontWeights.semibold as '600',
      textAlign: 'center' as const,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: colors.text,
        };
      case 'secondary':
      case 'outline':
      case 'ghost':
      case 'link':
        return {
          ...baseTextStyle,
          color: colors.background,
        };
      default:
        return baseTextStyle;
    }
  };

  return {
    // Base styles
    button: baseButton,
    
    // Size variations
    sizes,
    
    // Font sizes
    fontSizes,
    
    // Helper functions to get specific styles
    getVariantStyle,
    getTextStyle,
    
    // Additional styles
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.6,
    },
    icon: {
      marginHorizontal: theme.spacing.xs,
    },
    leftIcon: {
      marginRight: theme.spacing.xs,
    },
    rightIcon: {
      marginLeft: theme.spacing.xs,
    },
  };
};

export default createButtonStyles;

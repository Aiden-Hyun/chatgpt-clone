import { PresentationTheme } from '../../../interfaces/theme';

import { InputStatus, InputVariant } from '../../../interfaces/ui/Input.types';

/**
 * Creates input styles based on the current theme
 */
export const createInputStyles = (theme: PresentationTheme) => {
  // Base styles for all inputs
  const baseInput = {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.primary,
  };

  // Base container styles
  const baseContainer = {
    marginBottom: theme.spacing.md,
  };

  // Size variations
  const sizes = {
    sm: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      fontSize: theme.typography.fontSizes.sm,
      height: 36,
    },
    md: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.fontSizes.md,
      height: 44,
    },
    lg: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.fontSizes.lg,
      height: 52,
    },
  };

  // Status color mappings
  const statusColors = {
    default: {
      border: theme.borders.colors.medium,
      background: 'transparent',
    },
    success: {
      border: theme.colors.status.success.primary,
      background: theme.colors.status.success.background,
    },
    error: {
      border: theme.colors.status.error.primary,
      background: theme.colors.status.error.background,
    },
    warning: {
      border: theme.colors.status.warning.primary,
      background: theme.colors.status.warning.background,
    },
  };

  // Create styles for each variant
  const getVariantStyle = (variant: InputVariant, status: InputStatus) => {
    const colors = statusColors[status];
    
    switch (variant) {
      case 'default':
        return {
          backgroundColor: 'transparent',
          borderWidth: theme.borders.widths.thin,
          borderColor: colors.border,
          borderRadius: theme.borders.radius.md,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.background.secondary,
          borderWidth: theme.borders.widths.thin,
          borderColor: status !== 'default' ? colors.border : theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: theme.borders.widths.medium,
          borderColor: colors.border,
          borderRadius: theme.borders.radius.md,
        };
      case 'underlined':
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: theme.borders.widths.thin,
          borderBottomColor: colors.border,
          borderRadius: 0,
        };
      case 'search':
        return {
          backgroundColor: theme.colors.background.secondary,
          borderWidth: theme.borders.widths.thin,
          borderColor: status !== 'default' ? colors.border : theme.colors.background.secondary,
          borderRadius: theme.borders.radius.round,
          paddingLeft: theme.spacing.xl,
        };
      case 'chat':
        return {
          backgroundColor: 'transparent', // Let the bubble handle background
          borderWidth: 0, // No border - bubble handles styling
          borderRadius: 0, // No border radius - bubble handles it
          // minHeight: 36, // iOS Messages height
          // maxHeight: 120,
          // Web-style focus outline removal for all platforms
          outlineWidth: 0,
          outlineColor: 'transparent',
          boxShadow: 'none',
        };
      default:
        return {};
    }
  };

  return {
    // Base styles
    container: baseContainer,
    input: baseInput,
    
    // Size variations
    sizes,
    
    // Helper functions to get specific styles
    getVariantStyle,
    
    // Additional styles
    label: {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium as '500',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    helperText: {
      fontSize: theme.typography.fontSizes.xs,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    errorText: {
      fontSize: theme.typography.fontSizes.xs,
      color: theme.colors.status.error.primary,
      marginTop: theme.spacing.xs,
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: theme.opacity.disabled,
    },
    leftIconContainer: {
      position: 'absolute',
      left: theme.spacing.sm,
      height: theme.layout.dimensions.chat.sendButtonSize * 2,
      justifyContent: 'center',
    },
    rightIconContainer: {
      position: 'absolute',
      right: theme.spacing.sm,
      height: theme.layout.dimensions.chat.sendButtonSize * 2,
      justifyContent: 'center',
    },
    inputWithLeftIcon: {
      paddingLeft: theme.spacing.xl + theme.spacing.md,
    },
    inputWithRightIcon: {
      paddingRight: theme.spacing.xl + theme.spacing.md,
    },
  };
};

export default createInputStyles;

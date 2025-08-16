import { AppTheme } from '../../../features/theme/theme.types';
import { TextSize, TextVariant, TextWeight } from './Text.types';

/**
 * Creates text styles based on the current theme
 */
export const createTextStyles = (theme: AppTheme) => {
  // Font sizes mapping
  const fontSizes = {
    xs: theme.fontSizes.xs,
    sm: theme.fontSizes.sm,
    md: theme.fontSizes.md,
    lg: theme.fontSizes.lg,
    xl: theme.fontSizes.xl,
    xxl: theme.fontSizes.xxl,
  };

  // Font weights mapping
  const fontWeights = {
    regular: theme.fontWeights.regular,
    medium: theme.fontWeights.medium,
    semibold: theme.fontWeights.semibold,
    bold: theme.fontWeights.bold,
  };

  // Default styles for each variant
  const variants = {
    h1: {
      fontSize: fontSizes.xxl,
      fontWeight: fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      fontFamily: theme.fontFamily.primary,
    },
    h2: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      fontFamily: theme.fontFamily.primary,
    },
    h3: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      fontFamily: theme.fontFamily.primary,
    },
    title: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },
    subtitle: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
    },
    body: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.regular,
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },
    caption: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.regular,
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
    },
    label: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.fontFamily.primary,
    },
    link: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      color: theme.colors.primary,
      textDecorationLine: 'underline' as const,
      fontFamily: theme.fontFamily.primary,
    },
    error: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: theme.colors.status.error.primary,
      fontFamily: theme.fontFamily.primary,
    },
    code: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.regular,
      color: theme.colors.text.primary,
      fontFamily: 'monospace', // Use monospace font for code
      backgroundColor: theme.colors.background.tertiary,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.sm,
    },
  };

  // Helper function to get variant style
  const getVariantStyle = (variant: TextVariant) => {
    return variants[variant] || variants.body;
  };

  // Helper function to get size style
  const getSizeStyle = (size: TextSize) => {
    return { fontSize: fontSizes[size] };
  };

  // Helper function to get weight style
  const getWeightStyle = (weight: TextWeight) => {
    return { fontWeight: fontWeights[weight] };
  };

  return {
    // Base styles
    text: {
      fontFamily: theme.fontFamily.primary,
    },
    
    // Alignment styles
    center: {
      textAlign: 'center' as const,
    },
    right: {
      textAlign: 'right' as const,
    },
    
    // Style modifiers
    italic: {
      fontStyle: 'italic' as const,
    },
    underline: {
      textDecorationLine: 'underline' as const,
    },
    
    // Helper functions
    getVariantStyle,
    getSizeStyle,
    getWeightStyle,
  };
};

export default createTextStyles;

// Design tokens that remain consistent across all themes

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontFamily = {
  primary: 'System', // Uses San Francisco on iOS and Roboto on Android
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 2,      // Very slight rounding for Sharp Corners design
  sm: 2,      // Very slight rounding for Sharp Corners design
  md: 2,      // Very slight rounding for Sharp Corners design
  lg: 4,      // Slightly more rounding for larger elements
  xl: 4,      // Slightly more rounding for larger elements
  round: 9999, // For circular elements (avatars, etc.)
};

export const letterSpacing = {
  tight: 0,
  normal: 0.2,
  wide: 0.5,
};

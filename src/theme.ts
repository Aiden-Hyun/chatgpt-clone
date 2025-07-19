// theme.ts - Centralized styling constants for the entire app

export const colors = {
  // Primary colors
  primary: '#000000', // Black
  secondary: '#FFFFFF', // White
  
  // Background colors
  background: {
    primary: '#FFFFFF', // White
    secondary: '#F5F5F5', // Light gray for secondary backgrounds
    avatar: '#E1E1E1', // Light gray for avatar backgrounds
  },
  
  // Text colors
  text: {
    primary: '#000000', // Black
    secondary: '#333333', // Dark gray
    tertiary: '#666666', // Medium gray
    inverted: '#FFFFFF', // White text for dark backgrounds
  },
  
  // Border colors
  border: {
    light: '#E0E0E0', // Light gray
    medium: '#CCCCCC', // Medium gray
  },
  
  // Status colors
  status: {
    error: '#000000', // Black
    success: '#000000', // Black
  },
  
  // Button colors
  button: {
    primary: '#000000', // Black
    text: '#FFFFFF', // White
    disabled: '#CCCCCC', // Medium gray
  },
  
  // Message bubbles
  message: {
    user: '#000000', // Black
    assistant: '#F5F5F5', // Light gray
    userText: '#FFFFFF', // White
    assistantText: '#000000', // Black
  },

  // Shadow colors
  shadow: {
    light: '#000000',
    medium: '#000000',
    dark: '#000000',
  }
};

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
};

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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 9999, // For circular elements
};

export const shadows = {
  light: {
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  heavy: {
    shadowColor: colors.shadow.dark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
};

export const letterSpacing = {
  tight: 0,
  normal: 0.2,
  wide: 0.5,
};

// Export all theme elements as a single default object
export default {
  colors,
  fontSizes,
  fontWeights,
  fontFamily,
  spacing,
  borderRadius,
  shadows,
  letterSpacing,
};

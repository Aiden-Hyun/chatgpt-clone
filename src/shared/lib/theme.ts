// theme.ts - Centralized styling constants for the entire app with dark mode support

import { useColorScheme } from 'react-native';

// Design tokens that remain consistent across themes
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

export const letterSpacing = {
  tight: 0,
  normal: 0.2,
  wide: 0.5,
};

// Enhanced semantic color definitions
const lightColors = {
  // Primary colors
  primary: '#000000',
  secondary: '#FFFFFF',
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#FAFAFA',
    avatar: '#E1E1E1',
  },
  
  // Text colors
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
    quaternary: '#999999',
    inverted: '#FFFFFF',
  },
  
  // Border colors
  border: {
    light: '#E0E0E0',
    medium: '#CCCCCC',
    dark: '#999999',
  },
  
  // Enhanced Status Colors - Comprehensive semantic system
  status: {
    // Success states
    success: {
      primary: '#16A34A',
      secondary: '#22C55E',
      tertiary: '#4ADE80',
      background: '#F0FDF4',
      border: '#BBF7D0',
    },
    // Error states
    error: {
      primary: '#DC2626',
      secondary: '#EF4444',
      tertiary: '#F87171',
      background: '#FEF2F2',
      border: '#FECACA',
    },
    // Warning states
    warning: {
      primary: '#D97706',
      secondary: '#F59E0B',
      tertiary: '#FBBF24',
      background: '#FFFBEB',
      border: '#FED7AA',
    },
    // Info states
    info: {
      primary: '#2563EB',
      secondary: '#3B82F6',
      tertiary: '#60A5FA',
      background: '#EFF6FF',
      border: '#BFDBFE',
    },
    // Neutral states
    neutral: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      tertiary: '#D1D5DB',
      background: '#F9FAFB',
      border: '#E5E7EB',
    },
  },
  
  // Interactive States - Comprehensive interaction feedback
  interactive: {
    // Hover states
    hover: {
      primary: 'rgba(0, 0, 0, 0.05)',
      secondary: 'rgba(0, 0, 0, 0.08)',
      tertiary: 'rgba(0, 0, 0, 0.12)',
    },
    // Pressed states
    pressed: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.15)',
      tertiary: 'rgba(0, 0, 0, 0.2)',
    },
    // Focus states
    focus: {
      primary: 'rgba(37, 99, 235, 0.2)',
      secondary: 'rgba(37, 99, 235, 0.15)',
      tertiary: 'rgba(37, 99, 235, 0.1)',
    },
    // Disabled states
    disabled: {
      primary: 'rgba(0, 0, 0, 0.3)',
      secondary: 'rgba(0, 0, 0, 0.2)',
      tertiary: 'rgba(0, 0, 0, 0.1)',
    },
  },
  
  // Feedback Colors - User feedback and system states
  feedback: {
    // Loading states
    loading: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      pulse: 'rgba(107, 114, 128, 0.3)',
    },
    // Highlight states
    highlight: {
      primary: '#FEF3C7',
      secondary: '#FDE68A',
      tertiary: '#FCD34D',
    },
    // Selection states
    selection: {
      primary: 'rgba(37, 99, 235, 0.1)',
      secondary: 'rgba(37, 99, 235, 0.05)',
    },
    // Overlay states
    overlay: {
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.3)',
      dark: 'rgba(0, 0, 0, 0.5)',
    },
  },
  
  // Button colors
  button: {
    primary: '#000000',
    secondary: '#F5F5F5',
    text: '#FFFFFF',
    secondaryText: '#000000',
    disabled: '#CCCCCC',
    disabledText: '#999999',
  },
  
  // Message bubbles
  message: {
    user: '#000000',
    assistant: '#F5F5F5',
    userText: '#FFFFFF',
    assistantText: '#000000',
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
};

const darkColors = {
  // Primary colors - Using warmer, more comfortable tones
  primary: '#F8F9FA',
  secondary: '#1A1B1E',
  
  // Background colors - Warmer, less harsh dark tones
  background: {
    primary: '#1A1B1E',      // Warm dark background
    secondary: '#2C2E33',    // Slightly lighter warm dark
    tertiary: '#3A3D42',     // Even lighter for cards/sections
    avatar: '#4A4D52',       // Subtle avatar background
  },
  
  // Text colors - Softer, more readable tones
  text: {
    primary: '#F8F9FA',      // Soft white for primary text
    secondary: '#E9ECEF',    // Slightly dimmer for secondary
    tertiary: '#CED4DA',     // Muted for tertiary text
    quaternary: '#ADB5BD',   // Very muted for placeholders
    inverted: '#1A1B1E',     // Dark text for light backgrounds
  },
  
  // Border colors - Subtle, warm borders
  border: {
    light: '#495057',        // Subtle borders
    medium: '#6C757D',       // Medium borders
    dark: '#868E96',         // More visible borders
  },
  
  // Enhanced Status Colors - Dark mode variants
  status: {
    // Success states
    success: {
      primary: '#51CF66',
      secondary: '#69DB7C',
      tertiary: '#8CE99A',
      background: '#0F1419',
      border: '#2F3E2B',
    },
    // Error states
    error: {
      primary: '#FF6B6B',
      secondary: '#FF8787',
      tertiary: '#FFA5A5',
      background: '#1A0F0F',
      border: '#3E2B2B',
    },
    // Warning states
    warning: {
      primary: '#FFD43B',
      secondary: '#FFE066',
      tertiary: '#FFEC99',
      background: '#1A150F',
      border: '#3E352B',
    },
    // Info states
    info: {
      primary: '#74C0FC',
      secondary: '#8DD0FF',
      tertiary: '#A5D8FF',
      background: '#0F1419',
      border: '#2B3E3E',
    },
    // Neutral states
    neutral: {
      primary: '#ADB5BD',
      secondary: '#CED4DA',
      tertiary: '#E9ECEF',
      background: '#2C2E33',
      border: '#495057',
    },
  },
  
  // Interactive States - Dark mode variants
  interactive: {
    // Hover states
    hover: {
      primary: 'rgba(248, 249, 250, 0.05)',
      secondary: 'rgba(248, 249, 250, 0.08)',
      tertiary: 'rgba(248, 249, 250, 0.12)',
    },
    // Pressed states
    pressed: {
      primary: 'rgba(248, 249, 250, 0.1)',
      secondary: 'rgba(248, 249, 250, 0.15)',
      tertiary: 'rgba(248, 249, 250, 0.2)',
    },
    // Focus states
    focus: {
      primary: 'rgba(116, 192, 252, 0.2)',
      secondary: 'rgba(116, 192, 252, 0.15)',
      tertiary: 'rgba(116, 192, 252, 0.1)',
    },
    // Disabled states
    disabled: {
      primary: 'rgba(255, 255, 255, 0.3)',
      secondary: 'rgba(255, 255, 255, 0.2)',
      tertiary: 'rgba(255, 255, 255, 0.1)',
    },
  },
  
  // Feedback Colors - Dark mode variants
  feedback: {
    // Loading states
    loading: {
      primary: '#ADB5BD',
      secondary: '#CED4DA',
      pulse: 'rgba(173, 181, 189, 0.3)',
    },
    // Highlight states
    highlight: {
      primary: '#92400E',
      secondary: '#B45309',
      tertiary: '#D97706',
    },
    // Selection states
    selection: {
      primary: 'rgba(116, 192, 252, 0.1)',
      secondary: 'rgba(116, 192, 252, 0.05)',
    },
    // Overlay states
    overlay: {
      light: 'rgba(0, 0, 0, 0.2)',
      medium: 'rgba(0, 0, 0, 0.4)',
      dark: 'rgba(0, 0, 0, 0.6)',
    },
  },
  
  // Button colors - Comfortable, accessible
  button: {
    primary: '#F8F9FA',      // Light button on dark background
    secondary: '#495057',    // Subtle secondary button
    text: '#1A1B1E',         // Dark text on light button
    secondaryText: '#F8F9FA', // Light text on dark button
    disabled: '#495057',     // Muted disabled state
    disabledText: '#6C757D', // Muted disabled text
  },
  
  // Message bubbles - Comfortable chat colors
  message: {
    user: '#495057',         // Subtle user message background
    assistant: '#2C2E33',    // Slightly lighter assistant background
    userText: '#F8F9FA',     // Light text on dark user bubble
    assistantText: '#F8F9FA', // Light text on dark assistant bubble
  },

  // Shadow colors - Subtle, warm shadows
  shadow: {
    light: 'rgba(0, 0, 0, 0.2)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.4)',
  },
};

// Shadow configurations
export const shadows = {
  light: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  heavy: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
};

// Dark mode shadow configurations - More subtle
export const darkShadows = {
  light: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  heavy: {
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
};

// Theme object with both light and dark variants
export const theme = {
  light: {
    colors: lightColors,
    fontSizes,
    fontWeights,
    fontFamily,
    spacing,
    borderRadius,
    shadows,
    letterSpacing,
  },
  dark: {
    colors: darkColors,
    fontSizes,
    fontWeights,
    fontFamily,
    spacing,
    borderRadius,
    shadows: darkShadows,
    letterSpacing,
  },
};

// Hook to get current theme based on color scheme
export function useTheme() {
  const colorScheme = useColorScheme();
  return theme[colorScheme ?? 'light'];
}

// Legacy exports for backward compatibility (deprecated)
export const colors = lightColors;

// Export all theme elements as a single default object (deprecated)
export default {
  colors: lightColors,
  fontSizes,
  fontWeights,
  fontFamily,
  spacing,
  borderRadius,
  shadows,
  letterSpacing,
};

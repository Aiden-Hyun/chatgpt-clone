// theme.ts - Modern Minimalist design system with clean aesthetics

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

// Sharp Corners Design - Professional, business-like appearance with clean, structured components
const lightColors = {
  // Primary colors - Minimal palette
  primary: '#2D3748',      // Dark gray-blue
  secondary: '#4A5568',    // Medium gray
  
  // Background colors - Clean whites and grays
  background: {
    primary: '#FFFFFF',    // Pure white
    secondary: '#F7FAFC',  // Very light gray
    tertiary: '#EDF2F7',   // Light gray
    avatar: '#E2E8F0',     // Subtle gray
  },
  
  // Text colors - High contrast for readability
  text: {
    primary: '#1A202C',    // Almost black
    secondary: '#4A5568',  // Dark gray
    tertiary: '#718096',   // Medium gray
    quaternary: '#A0AEC0', // Light gray
    inverted: '#FFFFFF',   // White
  },
  
  // Border colors - Subtle and minimal
  border: {
    light: '#E2E8F0',      // Very light gray
    medium: '#CBD5E0',     // Light gray
    dark: '#A0AEC0',       // Medium gray
  },
  
  // Status colors - Muted and professional
  status: {
    success: {
      primary: '#38A169',   // Muted green
      secondary: '#48BB78',
      tertiary: '#68D391',
      background: '#F0FFF4',
      border: '#C6F6D5',
    },
    error: {
      primary: '#E53E3E',   // Muted red
      secondary: '#F56565',
      tertiary: '#FC8181',
      background: '#FFF5F5',
      border: '#FED7D7',
    },
    warning: {
      primary: '#D69E2E',   // Muted yellow
      secondary: '#ECC94B',
      tertiary: '#F6E05E',
      background: '#FFFBEB',
      border: '#FEEBC8',
    },
    info: {
      primary: '#3182CE',   // Muted blue
      secondary: '#4299E1',
      tertiary: '#63B3ED',
      background: '#EBF8FF',
      border: '#BEE3F8',
    },
    neutral: {
      primary: '#718096',   // Gray
      secondary: '#A0AEC0',
      tertiary: '#CBD5E0',
      background: '#F7FAFC',
      border: '#E2E8F0',
    },
  },
  
  // Interactive States - Subtle feedback
  interactive: {
    hover: {
      primary: 'rgba(45, 55, 72, 0.04)',
      secondary: 'rgba(45, 55, 72, 0.08)',
      tertiary: 'rgba(45, 55, 72, 0.12)',
    },
    pressed: {
      primary: 'rgba(45, 55, 72, 0.08)',
      secondary: 'rgba(45, 55, 72, 0.12)',
      tertiary: 'rgba(45, 55, 72, 0.16)',
    },
    focus: {
      primary: 'rgba(49, 130, 206, 0.15)',
      secondary: 'rgba(49, 130, 206, 0.1)',
      tertiary: 'rgba(49, 130, 206, 0.05)',
    },
    disabled: {
      primary: 'rgba(160, 174, 192, 0.4)',
      secondary: 'rgba(160, 174, 192, 0.3)',
      tertiary: 'rgba(160, 174, 192, 0.2)',
    },
  },
  
  // Feedback Colors - Minimal and clean
  feedback: {
    loading: {
      primary: '#A0AEC0',
      secondary: '#CBD5E0',
      pulse: 'rgba(160, 174, 192, 0.2)',
    },
    highlight: {
      primary: '#FEF5E7',
      secondary: '#FED7AA',
      tertiary: '#F6AD55',
    },
    selection: {
      primary: 'rgba(49, 130, 206, 0.08)',
      secondary: 'rgba(49, 130, 206, 0.04)',
    },
    overlay: {
      light: 'rgba(26, 32, 44, 0.08)',
      medium: 'rgba(26, 32, 44, 0.16)',
      dark: 'rgba(26, 32, 44, 0.32)',
    },
  },
  
  // Button colors - Clean and minimal
  button: {
    primary: '#2D3748',     // Dark gray-blue
    secondary: '#F7FAFC',   // Light gray
    text: '#FFFFFF',        // White text
    secondaryText: '#2D3748', // Dark text
    disabled: '#E2E8F0',    // Light gray
    disabledText: '#A0AEC0', // Medium gray
  },
  
  // Message bubbles - Clean and minimal
  message: {
    user: '#2D3748',        // Dark gray-blue
    assistant: '#F7FAFC',   // Light gray
    userText: '#FFFFFF',    // White text
    assistantText: '#2D3748', // Dark text
  },

  // Shadow colors - Very subtle
  shadow: {
    light: 'rgba(26, 32, 44, 0.06)',
    medium: 'rgba(26, 32, 44, 0.1)',
    dark: 'rgba(26, 32, 44, 0.16)',
  },
};

const darkColors = {
  // Primary colors - Minimal dark palette
  primary: '#F7FAFC',      // Light gray
  secondary: '#E2E8F0',    // Medium light gray
  
  // Background colors - Clean dark grays
  background: {
    primary: '#1A202C',    // Dark gray
    secondary: '#2D3748',  // Medium dark gray
    tertiary: '#4A5568',   // Medium gray
    avatar: '#718096',     // Light gray
  },
  
  // Text colors - High contrast for readability
  text: {
    primary: '#F7FAFC',    // Almost white
    secondary: '#E2E8F0',  // Light gray
    tertiary: '#CBD5E0',   // Medium light gray
    quaternary: '#A0AEC0', // Medium gray
    inverted: '#1A202C',   // Dark text
  },
  
  // Border colors - Subtle dark borders
  border: {
    light: '#4A5568',      // Medium gray
    medium: '#718096',     // Light gray
    dark: '#A0AEC0',       // Medium light gray
  },
  
  // Status colors - Muted dark variants
  status: {
    success: {
      primary: '#48BB78',
      secondary: '#68D391',
      tertiary: '#9AE6B4',
      background: '#0F1419',
      border: '#2F3E2B',
    },
    error: {
      primary: '#F56565',
      secondary: '#FC8181',
      tertiary: '#FEB2B2',
      background: '#1A0F0F',
      border: '#3E2B2B',
    },
    warning: {
      primary: '#ECC94B',
      secondary: '#F6E05E',
      tertiary: '#FAF089',
      background: '#1A150F',
      border: '#3E352B',
    },
    info: {
      primary: '#4299E1',
      secondary: '#63B3ED',
      tertiary: '#90CDF4',
      background: '#0F1419',
      border: '#2B3E3E',
    },
    neutral: {
      primary: '#A0AEC0',
      secondary: '#CBD5E0',
      tertiary: '#E2E8F0',
      background: '#2D3748',
      border: '#4A5568',
    },
  },
  
  // Interactive States - Dark mode variants
  interactive: {
    hover: {
      primary: 'rgba(247, 250, 252, 0.04)',
      secondary: 'rgba(247, 250, 252, 0.08)',
      tertiary: 'rgba(247, 250, 252, 0.12)',
    },
    pressed: {
      primary: 'rgba(247, 250, 252, 0.08)',
      secondary: 'rgba(247, 250, 252, 0.12)',
      tertiary: 'rgba(247, 250, 252, 0.16)',
    },
    focus: {
      primary: 'rgba(66, 153, 225, 0.15)',
      secondary: 'rgba(66, 153, 225, 0.1)',
      tertiary: 'rgba(66, 153, 225, 0.05)',
    },
    disabled: {
      primary: 'rgba(160, 174, 192, 0.4)',
      secondary: 'rgba(160, 174, 192, 0.3)',
      tertiary: 'rgba(160, 174, 192, 0.2)',
    },
  },
  
  // Feedback Colors - Dark mode variants
  feedback: {
    loading: {
      primary: '#A0AEC0',
      secondary: '#CBD5E0',
      pulse: 'rgba(160, 174, 192, 0.2)',
    },
    highlight: {
      primary: '#744210',
      secondary: '#975A16',
      tertiary: '#B7791F',
    },
    selection: {
      primary: 'rgba(66, 153, 225, 0.08)',
      secondary: 'rgba(66, 153, 225, 0.04)',
    },
    overlay: {
      light: 'rgba(26, 32, 44, 0.16)',
      medium: 'rgba(26, 32, 44, 0.32)',
      dark: 'rgba(26, 32, 44, 0.48)',
    },
  },
  
  // Button colors - Clean dark variants
  button: {
    primary: '#F7FAFC',    // Light button on dark background
    secondary: '#4A5568',  // Dark secondary button
    text: '#1A202C',       // Dark text on light button
    secondaryText: '#F7FAFC', // Light text on dark button
    disabled: '#4A5568',   // Muted disabled state
    disabledText: '#718096', // Muted disabled text
  },
  
  // Message bubbles - Clean dark variants
  message: {
    user: '#4A5568',       // Dark user message background
    assistant: '#2D3748',  // Darker assistant background
    userText: '#F7FAFC',   // Light text on dark user bubble
    assistantText: '#F7FAFC', // Light text on dark assistant bubble
  },

  // Shadow colors - Subtle dark shadows
  shadow: {
    light: 'rgba(0, 0, 0, 0.12)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.32)',
  },
};

// Sharp Corners Shadows - Professional and subtle
export const shadows = {
  light: {
    shadowColor: 'rgba(26, 32, 44, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  medium: {
    shadowColor: 'rgba(26, 32, 44, 0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  heavy: {
    shadowColor: 'rgba(26, 32, 44, 0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
};

// Dark mode shadows - Professional and subtle
export const darkShadows = {
  light: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
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

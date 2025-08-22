// Gradient Neumorphism theme - Index file
// Exports both light and dark variants along with theme metadata

import { BaseTheme } from '../../theme.types';
import { spacing } from '../tokens';
import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';

// Theme metadata
export const gradientNeumorphismThemeMetadata = {
  id: 'gradient-neumorphism',
  name: 'Gradient Neumorphism',
  description: 'Soft UI with gradient backgrounds and subtle shadows',
  version: '1.0.0',
  author: 'ChatGPT Clone Team',
  // Preview image would be imported here if available
  // preview: require('./preview.png'),
};

// Use global spacing tokens
const gradientNeumorphismSpacing = spacing;

// Gradient Neumorphism typography values (balanced)
const gradientNeumorphismTypography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontFamily: {
    primary: 'System', // Uses San Francisco on iOS and Roboto on Android
  },
  letterSpacing: {
    tight: 0,
    normal: 0.2,
    wide: 0.5,
  },
};

// Gradient Neumorphism border values (soft and rounded)
const gradientNeumorphismBorders = {
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  widths: {
    none: 0,
    thin: 1,
    light: 1,
    medium: 2,
    heavy: 3,
  },
  styles: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },
};

// Gradient Neumorphism layout values (balanced)
const gradientNeumorphismLayout = {
  buttonSizes: {
    header: 32,
    action: 44,
    icon: 40,
  },
  dimensions: {
    chat: {
      inputBorderRadius: 8,
      sendButtonSize: 32,
      inputPadding: {
        vertical: 12,
        horizontal: 16,
      },
      inputFontSize: 16,
      inputLineHeight: 20,
      secondaryFontSize: 14,
    },
    modal: {
      minWidth: 280,
      maxWidth: 400,
      maxHeight: 600,
    },
    drawer: {
      width: 280,
    },
    avatar: {
      small: 32,
      medium: 40,
      large: 48,
    },
    icon: {
      small: 16,
      medium: 20,
      large: 24,
    },
    card: {
      borderRadius: {
        small: 8,
        medium: 12,
        large: 16,
        xlarge: 20,
      },
    },
    button: {
      borderRadius: {
        small: 6,
        medium: 8,
        large: 12,
      },
    },
  },
  typography: {
    lineHeights: {
      compact: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    fontSizes: {
      tiny: 10,
      small: 12,
      medium: 14,
      large: 16,
    },
  },
  spacing: spacing,
};

// Gradient Neumorphism shadow values (enhanced for neumorphic effect)
const gradientNeumorphismShadows = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  // Enhanced neumorphic shadows
  neumorphic: {
    light: {
      shadowColor: '#ffffff',
      shadowOffset: { width: -20, height: -20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
    dark: {
      shadowColor: '#bebebe',
      shadowOffset: { width: 20, height: 20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
  },
  // Inset neumorphic shadows for pressed state
  inset: {
    light: {
      shadowColor: '#ffffff',
      shadowOffset: { width: 20, height: 20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
    dark: {
      shadowColor: '#bebebe',
      shadowOffset: { width: -20, height: -20 },
      shadowOpacity: 1,
      shadowRadius: 60,
      elevation: 20,
    },
  },
};

// Gradient Neumorphism animation values (smooth)
const gradientNeumorphismAnimations = {
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Gradient Neumorphism z-index values
const gradientNeumorphismZIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  tooltip: 20,
  modal: 100,
  overlay: 90,
  toast: 200,
  navigation: 50,
};

// Gradient Neumorphism opacity values
const gradientNeumorphismOpacity = {
  disabled: 0.5,
  overlay: 0.6,
  ghost: 0.7,
  subtle: 0.8,
  pressed: 0.9,
  hover: 0.95,
  focus: 1.0,
};

// Gradient Neumorphism transform values (subtle)
const gradientNeumorphismTransforms = {
  scale: {
    pressed: 0.98,
    hover: 1.02,
    active: 1.04,
  },
  rotate: {
    loading: '360deg',
    chevron: '180deg',
    arrow: '90deg',
  },
  translate: {
    pressed: { x: 0, y: 1 },
    hover: { x: 0, y: -1 },
  },
};

// Gradient Neumorphism transition values (smooth)
const gradientNeumorphismTransitions = {
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
};

// Gradient Neumorphism breakpoint values
const gradientNeumorphismBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
};

// Complete theme objects with all necessary properties
export const gradientNeumorphismTheme = {
  light: {
    colors: lightColors,
    spacing: gradientNeumorphismSpacing,
    typography: gradientNeumorphismTypography,
    borders: gradientNeumorphismBorders,
    layout: gradientNeumorphismLayout,
    shadows: {
      light: lightShadows.light,
      medium: lightShadows.medium,
      heavy: lightShadows.heavy,
      button: gradientNeumorphismShadows.button,
      card: gradientNeumorphismShadows.card,
      neumorphic: lightShadows.neumorphic,
      inset: lightShadows.inset,
    },
    animations: gradientNeumorphismAnimations,
    zIndex: gradientNeumorphismZIndex,
    opacity: gradientNeumorphismOpacity,
    transforms: gradientNeumorphismTransforms,
    transitions: gradientNeumorphismTransitions,
    breakpoints: gradientNeumorphismBreakpoints,
  } as BaseTheme,
  dark: {
    colors: darkColors,
    spacing: gradientNeumorphismSpacing,
    typography: gradientNeumorphismTypography,
    borders: gradientNeumorphismBorders,
    layout: gradientNeumorphismLayout,
    shadows: {
      light: darkShadows.light,
      medium: darkShadows.medium,
      heavy: darkShadows.heavy,
      button: gradientNeumorphismShadows.button,
      card: gradientNeumorphismShadows.card,
      neumorphic: darkShadows.neumorphic,
      inset: darkShadows.inset,
    },
    animations: gradientNeumorphismAnimations,
    zIndex: gradientNeumorphismZIndex,
    opacity: gradientNeumorphismOpacity,
    transforms: gradientNeumorphismTransforms,
    transitions: gradientNeumorphismTransitions,
    breakpoints: gradientNeumorphismBreakpoints,
  } as BaseTheme,
};

// Default export for easy importing
export default {
  ...gradientNeumorphismThemeMetadata,
  theme: gradientNeumorphismTheme,
};

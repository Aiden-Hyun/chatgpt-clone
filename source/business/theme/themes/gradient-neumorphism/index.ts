// Gradient Neumorphism theme - Index file
// Exports both light and dark variants along with theme metadata

import { BaseTheme } from '../../interfaces/theme';
import { spacing } from '../../interfaces/tokens';
import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';

// Theme metadata
export const gradientNeumorphismThemeMetadata = {
  id: 'gradient-neumorphism',
  name: 'Gradient Neumorphism',
  description: 'Modern neumorphic design with subtle gradients and soft shadows',
  version: '1.0.0',
  author: 'ChatGPT Clone Team',
  // Preview image would be imported here if available
  // preview: require('./preview.png'),
};

// Use global spacing tokens
const gradientNeumorphismSpacing = spacing;

// Gradient Neumorphism typography values (modern and clean)
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

// Gradient Neumorphism border values (subtle and clean)
const gradientNeumorphismBorders = {
  colors: {
    light: 'rgba(255, 255, 255, 0.1)',      // White with 10% transparency for light borders
    medium: 'rgba(226, 232, 240, 0.15)',    // Light gray with 15% transparency for medium borders
    dark: 'rgba(203, 213, 225, 0.2)',       // Medium gray with 20% transparency for dark borders
  },
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

// Dark border values for gradient neumorphism
const gradientNeumorphismDarkBorders = {
  colors: {
    light: 'rgba(148, 163, 184, 0.1)',      // Slate-400 with 10% transparency for light borders
    medium: 'rgba(100, 116, 139, 0.15)',    // Slate-500 with 15% transparency for medium borders
    dark: 'rgba(71, 85, 105, 0.2)',         // Slate-600 with 20% transparency for dark borders
  },
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

// Gradient Neumorphism layout values (modern and clean)
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

// Gradient Neumorphism animation values (smooth and subtle)
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

// Gradient Neumorphism transform values (subtle and smooth)
const gradientNeumorphismTransforms = {
  scale: {
    pressed: 0.98,
    hover: 1.02,
    active: 1.05,
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

// Gradient Neumorphism transition values (smooth and subtle)
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
    shadows: lightShadows,
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
    borders: gradientNeumorphismDarkBorders,
    layout: gradientNeumorphismLayout,
    shadows: darkShadows,
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
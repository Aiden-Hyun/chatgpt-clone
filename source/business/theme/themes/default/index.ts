// Default theme - Index file
// Exports both light and dark variants along with theme metadata

import { BaseTheme , spacing } from '../../../interfaces';

import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';

// Theme metadata
export const defaultThemeMetadata = {
  id: 'default',
  name: 'Default',
  description: 'Clean, minimalist design with sharp corners and professional aesthetics',
  version: '1.0.0',
  author: 'ChatGPT Clone Team',
  // Preview image would be imported here if available
  // preview: require('./preview.png'),
};

// Use global spacing tokens
const defaultSpacing = spacing;

// Default typography values (moved from tokens.ts to theme management)
const defaultTypography = {
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

// Default border values (moved from tokens.ts to theme management)
const defaultBorders = {
  colors: {
    light: '#E2E8F0',      // Very light gray
    medium: '#CBD5E0',     // Light gray
    dark: '#A0AEC0',       // Medium gray
  },
  radius: {
    xs: 2,
    sm: 4,
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

// Dark border values
const darkBorders = {
  colors: {
    light: '#4A5568',      // Medium gray
    medium: '#718096',     // Light gray
    dark: '#A0AEC0',       // Medium light gray
  },
  radius: {
    xs: 2,
    sm: 4,
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

// Default layout values
const defaultLayout = {
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



// Default animation values
const defaultAnimations = {
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

// Default z-index values
const defaultZIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  tooltip: 20,
  modal: 100,
  overlay: 90,
  toast: 200,
  navigation: 50,
};

// Default opacity values
const defaultOpacity = {
  disabled: 0.5,
  overlay: 0.6,
  ghost: 0.7,
  subtle: 0.8,
  pressed: 0.9,
  hover: 0.95,
  focus: 1.0,
};

// Default transform values
const defaultTransforms = {
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

// Default transition values
const defaultTransitions = {
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

// Default breakpoint values
const defaultBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
};

// Complete theme objects with all necessary properties
export const defaultTheme = {
  light: {
    colors: lightColors,
    spacing: defaultSpacing,
    typography: defaultTypography,
    borders: defaultBorders,
    layout: defaultLayout,
    shadows: lightShadows,
    animations: defaultAnimations,
    zIndex: defaultZIndex,
    opacity: defaultOpacity,
    transforms: defaultTransforms,
    transitions: defaultTransitions,
    breakpoints: defaultBreakpoints,
  } as BaseTheme,
  dark: {
    colors: darkColors,
    spacing: defaultSpacing,
    typography: defaultTypography,
    borders: darkBorders,
    layout: defaultLayout,
    shadows: darkShadows,
    animations: defaultAnimations,
    zIndex: defaultZIndex,
    opacity: defaultOpacity,
    transforms: defaultTransforms,
    transitions: defaultTransitions,
    breakpoints: defaultBreakpoints,
  } as BaseTheme,
};

// Default export for easy importing
export default {
  ...defaultThemeMetadata,
  theme: defaultTheme,
};
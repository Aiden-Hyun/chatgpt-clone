// Claymorphism theme - Index file
// Exports both light and dark variants along with theme metadata

import { BaseTheme } from '../../theme.types';
import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';
import { spacing } from '../tokens';

// Theme metadata
export const claymorphismThemeMetadata = {
  id: 'claymorphism',
  name: 'Claymorphism',
  description: 'Soft, puffy 3D elements with vibrant colors and rounded corners',
  version: '1.0.0',
  author: 'ChatGPT Clone Team',
  // Preview image would be imported here if available
  // preview: require('./preview.png'),
};

// Use global spacing tokens
const claymorphismSpacing = spacing;

// Claymorphism typography values (slightly larger for better readability)
const claymorphismTypography = {
  fontSizes: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 26,
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

// Claymorphism border values (extra rounded for the clay effect)
const claymorphismBorders = {
  radius: {
    xs: 8,    // Significantly more rounded
    sm: 12,   // Significantly more rounded
    md: 16,   // Significantly more rounded
    lg: 24,   // Significantly more rounded
    xl: 32,   // Significantly more rounded
    round: 9999, // For circular elements (avatars, etc.)
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

// Claymorphism layout values (generous spacing for puffy feel)
const claymorphismLayout = {
  buttonSizes: {
    header: 36,
    action: 48,
    icon: 44,
  },
  dimensions: {
    chat: {
      inputBorderRadius: 12,
      sendButtonSize: 36,
      inputPadding: {
        vertical: 16,
        horizontal: 20,
      },
      inputFontSize: 18,
      inputLineHeight: 22,
      secondaryFontSize: 16,
    },
    modal: {
      minWidth: 300,
      maxWidth: 450,
      maxHeight: 650,
    },
    drawer: {
      width: 300,
    },
    avatar: {
      small: 36,
      medium: 44,
      large: 52,
    },
    icon: {
      small: 18,
      medium: 22,
      large: 26,
    },
    card: {
      borderRadius: {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 24,
      },
    },
    button: {
      borderRadius: {
        small: 10,
        medium: 12,
        large: 16,
      },
    },
  },
  typography: {
    lineHeights: {
      compact: 1.3,
      normal: 1.5,
      relaxed: 1.7,
    },
    fontSizes: {
      tiny: 12,
      small: 14,
      medium: 16,
      large: 18,
    },
  },
  spacing: spacing,
};

// Claymorphism shadow values (more dramatic for 3D effect)
const claymorphismShadows = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
};

// Claymorphism animation values (slightly slower for smooth feel)
const claymorphismAnimations = {
  durations: {
    fast: 200,
    normal: 400,
    slow: 600,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Claymorphism z-index values
const claymorphismZIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  tooltip: 20,
  modal: 100,
  overlay: 90,
  toast: 200,
  navigation: 50,
};

// Claymorphism opacity values
const claymorphismOpacity = {
  disabled: 0.5,
  overlay: 0.6,
  ghost: 0.7,
  subtle: 0.8,
  pressed: 0.9,
  hover: 0.95,
  focus: 1.0,
};

// Claymorphism transform values (more dramatic scaling)
const claymorphismTransforms = {
  scale: {
    pressed: 0.95,
    hover: 1.05,
    active: 1.08,
  },
  rotate: {
    loading: '360deg',
    chevron: '180deg',
    arrow: '90deg',
  },
  translate: {
    pressed: { x: 0, y: 2 },
    hover: { x: 0, y: -2 },
  },
};

// Claymorphism transition values (slightly slower)
const claymorphismTransitions = {
  durations: {
    fast: 200,
    normal: 400,
    slow: 600,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
};

// Claymorphism breakpoint values
const claymorphismBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
};

// Complete theme objects with all necessary properties
export const claymorphismTheme = {
  light: {
    colors: lightColors,
    spacing: claymorphismSpacing,
    typography: claymorphismTypography,
    borders: claymorphismBorders,
    layout: claymorphismLayout,
    shadows: lightShadows,
    animations: claymorphismAnimations,
    zIndex: claymorphismZIndex,
    opacity: claymorphismOpacity,
    transforms: claymorphismTransforms,
    transitions: claymorphismTransitions,
    breakpoints: claymorphismBreakpoints,
  } as BaseTheme,
  dark: {
    colors: darkColors,
    spacing: claymorphismSpacing,
    typography: claymorphismTypography,
    borders: claymorphismBorders,
    layout: claymorphismLayout,
    shadows: darkShadows,
    animations: claymorphismAnimations,
    zIndex: claymorphismZIndex,
    opacity: claymorphismOpacity,
    transforms: claymorphismTransforms,
    transitions: claymorphismTransitions,
    breakpoints: claymorphismBreakpoints,
  } as BaseTheme,
};

// Default export for easy importing
export default {
  ...claymorphismThemeMetadata,
  theme: claymorphismTheme,
};

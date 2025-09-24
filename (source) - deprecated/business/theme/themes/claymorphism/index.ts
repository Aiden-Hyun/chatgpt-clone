// Claymorphism theme - Index file
// Exports both light and dark variants along with theme metadata

import { BaseTheme , spacing } from '../../../interfaces';

import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';

// Theme metadata
export const claymorphismThemeMetadata = {
  id: 'claymorphism',
  name: 'Claymorphism',
  description: 'Soft, clay-like design with subtle shadows and rounded corners',
  version: '1.0.0',
  author: 'ChatGPT Clone Team',
  // Preview image would be imported here if available
  // preview: require('./preview.png'),
};

// Use global spacing tokens
const claymorphismSpacing = spacing;

// Claymorphism typography values (soft and friendly)
const claymorphismTypography = {
  fontSizes: {
    xs: 13,
    sm: 15,
    md: 17,
    lg: 19,
    xl: 21,
    xxl: 25,
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

// Claymorphism border values (soft and rounded)
const claymorphismBorders = {
  colors: {
    light: '#E2E8F0',      // Very light gray
    medium: '#CBD5E0',     // Light gray
    dark: '#A0AEC0',       // Medium gray
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
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

// Dark border values for claymorphism
const claymorphismDarkBorders = {
  colors: {
    light: '#4A5568',      // Medium gray
    medium: '#718096',     // Light gray
    dark: '#A0AEC0',       // Medium light gray
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
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

// Claymorphism layout values (soft and friendly)
const claymorphismLayout = {
  buttonSizes: {
    header: 34,
    action: 46,
    icon: 42,
  },
  dimensions: {
    chat: {
      inputBorderRadius: 10,
      sendButtonSize: 34,
      inputPadding: {
        vertical: 14,
        horizontal: 18,
      },
      inputFontSize: 17,
      inputLineHeight: 21,
      secondaryFontSize: 15,
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
      small: 34,
      medium: 42,
      large: 50,
    },
    icon: {
      small: 17,
      medium: 21,
      large: 25,
    },
    card: {
      borderRadius: {
        small: 10,
        medium: 14,
        large: 18,
        xlarge: 22,
      },
    },
    button: {
      borderRadius: {
        small: 8,
        medium: 10,
        large: 14,
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
      tiny: 11,
      small: 13,
      medium: 15,
      large: 17,
    },
  },
  spacing: spacing,
};

// Claymorphism animation values (soft and bouncy)
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

// Claymorphism transform values (soft and bouncy)
const claymorphismTransforms = {
  scale: {
    pressed: 0.96,
    hover: 1.04,
    active: 1.06,
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

// Claymorphism transition values (soft and bouncy)
const claymorphismTransitions = {
  durations: {
    fast: 200,
    normal: 400,
    slow: 600,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy ease out
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
    borders: claymorphismDarkBorders,
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
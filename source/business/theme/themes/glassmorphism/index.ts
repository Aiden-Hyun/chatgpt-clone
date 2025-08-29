// Glassmorphism theme - Index file
// Exports both light and dark variants along with theme metadata

import { BaseTheme } from '../../interfaces/theme';
import { spacing } from '../../interfaces/tokens';
import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';

// Theme metadata
export const glassmorphismThemeMetadata = {
  id: 'glassmorphism',
  name: 'Glassmorphism',
  description: 'Frosted glass effect with transparency and subtle blur',
  version: '1.0.0',
  author: 'ChatGPT Clone Team',
  // Preview image would be imported here if available
  // preview: require('./preview.png'),
};

// Use global spacing tokens
const glassmorphismSpacing = spacing;

// Glassmorphism typography values (elegant and refined)
const glassmorphismTypography = {
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

// Glassmorphism border values (subtle and refined)
const glassmorphismBorders = {
  colors: {
    light: 'rgba(255, 255, 255, 0.6)',      // White with 60% transparency for light borders
    medium: 'rgba(226, 232, 240, 0.4)',     // Light gray with 40% transparency for medium borders
    dark: 'rgba(203, 213, 225, 0.3)',       // Medium gray with 30% transparency for dark borders
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

// Dark mode borders for glassmorphism
const glassmorphismDarkBorders = {
  colors: {
    light: 'rgba(148, 163, 184, 0.5)',      // Slate-400 with 50% transparency for light borders
    medium: 'rgba(100, 116, 139, 0.4)',     // Slate-500 with 40% transparency for medium borders
    dark: 'rgba(71, 85, 105, 0.3)',         // Slate-600 with 30% transparency for dark borders
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

// Glassmorphism layout values (elegant and refined)
const glassmorphismLayout = {
  buttonSizes: {
    header: 30,
    action: 42,
    icon: 38,
  },
  dimensions: {
    chat: {
      inputBorderRadius: 6,
      sendButtonSize: 30,
      inputPadding: {
        vertical: 10,
        horizontal: 14,
      },
      inputFontSize: 15,
      inputLineHeight: 19,
      secondaryFontSize: 13,
    },
    modal: {
      minWidth: 260,
      maxWidth: 380,
      maxHeight: 580,
    },
    drawer: {
      width: 260,
    },
    avatar: {
      small: 30,
      medium: 38,
      large: 46,
    },
    icon: {
      small: 15,
      medium: 19,
      large: 23,
    },
    card: {
      borderRadius: {
        small: 6,
        medium: 8,
        large: 12,
        xlarge: 16,
      },
    },
    button: {
      borderRadius: {
        small: 4,
        medium: 6,
        large: 8,
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
      tiny: 9,
      small: 11,
      medium: 13,
      large: 15,
    },
  },
  spacing: spacing,
};

// Glassmorphism shadow values (subtle for glass effect)
const glassmorphismShadows = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 3,
  },
};

// Glassmorphism animation values (smooth and elegant)
const glassmorphismAnimations = {
  durations: {
    fast: 180,
    normal: 350,
    slow: 550,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Glassmorphism z-index values
const glassmorphismZIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  tooltip: 20,
  modal: 100,
  overlay: 90,
  toast: 200,
  navigation: 50,
};

// Glassmorphism opacity values (more transparency for glass effect)
const glassmorphismOpacity = {
  disabled: 0.4,
  overlay: 0.7,
  ghost: 0.6,
  subtle: 0.7,
  pressed: 0.85,
  hover: 0.9,
  focus: 1.0,
};

// Glassmorphism transform values (subtle and elegant)
const glassmorphismTransforms = {
  scale: {
    pressed: 0.97,
    hover: 1.03,
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

// Glassmorphism transition values (smooth and elegant)
const glassmorphismTransitions = {
  durations: {
    fast: 180,
    normal: 350,
    slow: 550,
  },
  easings: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
};

// Glassmorphism breakpoint values
const glassmorphismBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
};

// Complete theme objects with all necessary properties
export const glassmorphismTheme = {
  light: {
    colors: lightColors,
    spacing: glassmorphismSpacing,
    typography: glassmorphismTypography,
    borders: glassmorphismBorders,
    layout: glassmorphismLayout,
    shadows: lightShadows,
    animations: glassmorphismAnimations,
    zIndex: glassmorphismZIndex,
    opacity: glassmorphismOpacity,
    transforms: glassmorphismTransforms,
    transitions: glassmorphismTransitions,
    breakpoints: glassmorphismBreakpoints,
  } as BaseTheme,
  dark: {
    colors: darkColors,
    spacing: glassmorphismSpacing,
    typography: glassmorphismTypography,
    borders: glassmorphismDarkBorders,
    layout: glassmorphismLayout,
    shadows: darkShadows,
    animations: glassmorphismAnimations,
    zIndex: glassmorphismZIndex,
    opacity: glassmorphismOpacity,
    transforms: glassmorphismTransforms,
    transitions: glassmorphismTransitions,
    breakpoints: glassmorphismBreakpoints,
  } as BaseTheme,
};

// Default export for easy importing
export default {
  ...glassmorphismThemeMetadata,
  theme: glassmorphismTheme,
};
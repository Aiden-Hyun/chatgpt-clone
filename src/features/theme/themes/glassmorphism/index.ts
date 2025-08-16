// Glassmorphism theme - Index file
// Exports both light and dark variants along with theme metadata

import { borderRadius, fontFamily, fontSizes, fontWeights, letterSpacing, spacing } from '../tokens';
import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';

// Theme metadata
export const glassmorphismThemeMetadata = {
  id: 'glassmorphism',
  name: 'Glassmorphism',
  description: 'Modern frosted glass effect with transparency, blur, and subtle borders',
  version: '1.0.0',
  author: 'ChatGPT Clone Team',
  // Preview image would be imported here if available
  // preview: require('./preview.png'),
};

// Complete theme objects with all necessary properties
export const glassmorphismTheme = {
  light: {
    colors: lightColors,
    fontSizes,
    fontWeights,
    fontFamily,
    spacing,
    borderRadius: {
      ...borderRadius,
      // Enhanced border radius for more pronounced glassmorphic effect
      xs: 6,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
    },
    shadows: lightShadows,
    letterSpacing,
  },
  dark: {
    colors: darkColors,
    fontSizes,
    fontWeights,
    fontFamily,
    spacing,
    borderRadius: {
      ...borderRadius,
      // Enhanced border radius for more pronounced glassmorphic effect
      xs: 6,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
    },
    shadows: darkShadows,
    letterSpacing,
  },
};

// Default export for easy importing
export default {
  ...glassmorphismThemeMetadata,
  theme: glassmorphismTheme,
};
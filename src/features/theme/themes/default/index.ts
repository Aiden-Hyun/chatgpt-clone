// Default theme - Index file
// Exports both light and dark variants along with theme metadata

import { borderRadius, fontFamily, fontSizes, fontWeights, letterSpacing, spacing } from '../tokens';
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

// Complete theme objects with all necessary properties
export const defaultTheme = {
  light: {
    colors: lightColors,
    fontSizes,
    fontWeights,
    fontFamily,
    spacing,
    borderRadius,
    shadows: lightShadows,
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

// Default export for easy importing
export default {
  ...defaultThemeMetadata,
  theme: defaultTheme,
};

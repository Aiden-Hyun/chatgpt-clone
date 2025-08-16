// Claymorphism theme - Index file
// Exports both light and dark variants along with theme metadata

import { borderRadius, fontFamily, fontSizes, fontWeights, letterSpacing, spacing } from '../tokens';
import { darkColors, darkShadows } from './dark';
import { lightColors, lightShadows } from './light';

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

// Complete theme objects with all necessary properties
export const claymorphismTheme = {
  light: {
    colors: lightColors,
    fontSizes,
    fontWeights,
    fontFamily,
    spacing,
    // Override border radius for extra rounded corners in claymorphism
    borderRadius: {
      ...borderRadius,
      xs: 8,    // Significantly more rounded
      sm: 12,   // Significantly more rounded
      md: 16,   // Significantly more rounded
      lg: 24,   // Significantly more rounded
      xl: 32,   // Significantly more rounded
      round: 9999, // For circular elements (avatars, etc.)
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
    // Override border radius for extra rounded corners in claymorphism
    borderRadius: {
      ...borderRadius,
      xs: 8,    // Significantly more rounded
      sm: 12,   // Significantly more rounded
      md: 16,   // Significantly more rounded
      lg: 24,   // Significantly more rounded
      xl: 32,   // Significantly more rounded
      round: 9999, // For circular elements (avatars, etc.)
    },
    shadows: darkShadows,
    letterSpacing,
  },
};

// Default export for easy importing
export default {
  ...claymorphismThemeMetadata,
  theme: claymorphismTheme,
};

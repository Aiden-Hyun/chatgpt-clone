// Enhanced theme types to support theme switching

import { lightColors } from './themes/default/light';
import { borderRadius, fontFamily, fontSizes, fontWeights, letterSpacing, spacing } from './themes/tokens';

// Helper type for deep partial objects
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// Base theme structure
export interface BaseTheme {
  colors: typeof lightColors;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  fontFamily: typeof fontFamily;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  letterSpacing: typeof letterSpacing;
  shadows: {
    light: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    heavy: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

// Complete theme with both light and dark variants
export interface CompleteTheme {
  light: BaseTheme;
  dark: BaseTheme;
}

// Theme metadata
export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  preview?: any; // Image source
}

// Complete theme with metadata
export interface ThemeWithMetadata extends ThemeMetadata {
  theme: CompleteTheme;
}

// Legacy type aliases for backward compatibility
export type AppTheme = BaseTheme;
export type AppThemeColors = BaseTheme['colors'];
export type PartialAppTheme = DeepPartial<AppTheme>;

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme style (which theme set to use)
export type ThemeStyle = string;
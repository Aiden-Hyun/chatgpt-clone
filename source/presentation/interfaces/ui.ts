/**
 * UI-related interfaces for presentation layer
 */

// ============================================================================
// STYLE UTILITY TYPES - Types for style utilities
// ============================================================================

/**
 * Style function parameters
 */
export interface StyleParams {
  theme: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// COMPONENT TYPES - Types for UI components
// ============================================================================

// ============================================================================
// THEME TYPES - Types for theming
// ============================================================================

/**
 * Theme color palette
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };
  interactive: {
    hover: {
      primary: string;
      secondary: string;
    };
  };
  syntax?: {
    background: string;
  };
  [key: string]: unknown;
}

/**
 * Theme spacing
 */
export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  [key: string]: number;
}

/**
 * Theme borders
 */
export interface ThemeBorders {
  colors: {
    light: string;
    medium: string;
    dark: string;
  };
  radius: {
    small: number;
    medium: number;
    large: number;
  };
}

/**
 * Complete theme interface
 */
export interface AppTheme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
  [key: string]: unknown;
}

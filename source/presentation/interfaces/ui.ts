/**
 * UI-related interfaces for presentation layer
 */

// ============================================================================
// PLATFORM TYPES - Types for platform-specific styling
// ============================================================================

/**
 * Platform-specific font configuration
 */
export interface PlatformFonts {
  ios: string;
  android: string;
  web: string;
  default: string;
}

/**
 * Platform-specific style values
 */
export interface PlatformStyles {
  fontFamily?: string;
  fontVariant?: string[];
  includeFontPadding?: boolean;
  [key: string]: unknown;
}

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

/**
 * Style function return type
 */
export type StyleFunction<T extends StyleParams = StyleParams> = (params: T) => Record<string, unknown>;

/**
 * Style utility function
 */
export type StyleUtility<T = unknown> = (value: T) => Record<string, unknown>;

// ============================================================================
// COMPONENT TYPES - Types for UI components
// ============================================================================

/**
 * Button component props
 */
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  [key: string]: unknown;
}

/**
 * Input component props
 */
export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  [key: string]: unknown;
}

/**
 * Card component props
 */
export interface CardProps {
  children: React.ReactNode;
  padding?: number;
  margin?: number;
  [key: string]: unknown;
}

/**
 * Text component props
 */
export interface TextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'body' | 'caption' | 'label';
  color?: string;
  [key: string]: unknown;
}

/**
 * Dropdown component props
 */
export interface DropdownProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  [key: string]: unknown;
}

/**
 * List item component props
 */
export interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  [key: string]: unknown;
}

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

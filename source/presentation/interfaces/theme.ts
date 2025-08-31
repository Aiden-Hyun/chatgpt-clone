// Enhanced theme types to support theme switching



// Helper type for deep partial objects
type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// Required color structure (ALL color properties that themes can customize)
export interface RequiredColors {
  // Core colors
  primary: string;
  secondary: string;
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    avatar: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    inverted: string;
  };
  
  // Status colors
  status: {
    success: ColorVariant;
    error: ColorVariant;
    warning: ColorVariant;
    info: ColorVariant;
    neutral: ColorVariant;
  };
  
  // Interactive states
  interactive: {
    hover: ColorShade;
    pressed: ColorShade;
    focus: ColorShade;
    disabled: ColorShade;
  };
  
  // Feedback colors
  feedback: {
    loading: { primary: string; secondary: string; pulse: string; };
    highlight: ColorShade;
    selection: { primary: string; secondary: string; };
    overlay: { light: string; medium: string; dark: string; };
  };
  
  // Component colors
  button: {
    primary: string;
    secondary: string;
    text: string;
    secondaryText: string;
    disabled: string;
    disabledText: string;
  };
  
  message: {
    user: string;
    assistant: string;
    userText: string;
    assistantText: string;
  };

  syntax: {
    keyword: string;
    string: string;
    comment: string;
    number: string;
    function: string;
    variable: string;
    operator: string;
    background: string;
    type: string;
    builtin: string;
    tag: string;
    attribute: string;
  };
  
  // Theme-specific colors (generic structure)
  glass: ColorShade;
  claymorphism: {
    background: string;
    shadow: string;
    highlight: string;
    palette: ColorPalette;
  };
}

// Reusable color type definitions
type ColorVariant = {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  border: string;
};

type ColorShade = {
  primary: string;
  secondary: string;
  tertiary: string;
};

type ColorPalette = {
  red: string;
  orange: string;
  yellow: string;
  green: string;
  teal: string;
  cyan: string;
  blue: string;
  indigo: string;
  purple: string;
  pink: string;
};

// Required spacing structure (moved from tokens.ts to theme management)
export interface RequiredSpacing {
  xxs: number;                    // Used in: UserMessage
  xs: number;                     // Used in: Various components
  sm: number;                     // Used in: Various components
  md: number;                     // Used in: Various components
  lg: number;                     // Used in: Various components
  xl: number;                     // Used in: Various components
  xxl: number;                    // Used in: Various components
  xxxl: number;                   // Used in: Auth pages
}

// Required typography structure (moved from tokens.ts to theme management)
export interface RequiredTypography {
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeights: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontFamily: {
    primary: string;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
  };
}

// Required z-index structure (NEW - for layering control)
export interface RequiredZIndex {
  base: number;                   // Base layer
  card: number;                   // Card layer
  dropdown: number;               // Dropdown layer
  tooltip: number;                // Tooltip layer
  modal: number;                  // Modal layer
  overlay: number;                // Overlay layer
  toast: number;                  // Toast layer
  navigation: number;             // Navigation layer
}

// Required opacity structure (NEW - for transparency control)
export interface RequiredOpacity {
  disabled: number;               // Disabled state opacity
  overlay: number;                // Overlay opacity
  ghost: number;                  // Ghost button opacity
  subtle: number;                 // Subtle element opacity
  pressed: number;                // Pressed state opacity
  hover: number;                  // Hover state opacity
  focus: number;                  // Focus state opacity
}

// Required transform structure (NEW - for animation control)
export interface RequiredTransforms {
  scale: {
    pressed: number;              // Scale when pressed
    hover: number;                // Scale when hovered
    active: number;               // Scale when active
  };
  rotate: {
    loading: string;              // Rotation for loading states
    chevron: string;              // Rotation for chevron icons
    arrow: string;                // Rotation for arrow icons
  };
  translate: {
    pressed: { x: number; y: number }; // Translation when pressed
    hover: { x: number; y: number };   // Translation when hovered
  };
}

// Required transition structure (NEW - for animation timing)
export interface RequiredTransitions {
  durations: {
    fast: number;                 // Fast transitions (150ms)
    normal: number;               // Normal transitions (300ms)
    slow: number;                 // Slow transitions (500ms)
  };
  easings: {
    easeIn: string;               // Ease in curve
    easeOut: string;              // Ease out curve
    easeInOut: string;            // Ease in-out curve
    linear: string;               // Linear curve
  };
}

// Required breakpoints structure (NEW - for responsive design)
export interface RequiredBreakpoints {
  mobile: number;                 // Mobile breakpoint
  tablet: number;                 // Tablet breakpoint
  desktop: number;                // Desktop breakpoint
  wide: number;                   // Wide screen breakpoint
}

// Required border structure (combines border radius and border properties)
export interface RequiredBorders {
  // Border colors
  colors: {
    light: string;
    medium: string;
    dark: string;
  };
  
  // Border radius properties (moved from tokens.ts)
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
  
  // Border width properties
  widths: {
    none: number;                   // Used in: Various components
    thin: number;                   // Used in: Various components
    light: number;                  // Used in: CustomAlert
    medium: number;                 // Used in: Various components
    heavy: number;                  // Used in: Various components
  };
  
  // Border style properties
  styles: {
    solid: string;                  // Used in: Various components
    dashed: string;                 // Used in: Various components
    dotted: string;                 // Used in: Various components
  };
}

// Required layout structure (ALL layout properties used in project)
export interface RequiredLayout {
  // Button dimensions that can vary between themes
  buttonSizes: {
    header: number;      // Used in: ChatHeader, Auth pages, etc.
    action: number;      // Used in: Auth pages, buttons
    icon: number;        // Used in: Various icon buttons
  };
  
  // Component dimensions that can vary between themes
  dimensions: {
    chat: {
      inputBorderRadius: number;    // Used in: ChatInputBar
      sendButtonSize: number;       // Used in: ChatInputBar
      inputPadding: {
        vertical: number;           // Used in: ChatInputBar
        horizontal: number;         // Used in: ChatInputBar
      };
      inputFontSize: number;        // Used in: ChatInputBar
      inputLineHeight: number;      // Used in: ChatInputBar
      secondaryFontSize: number;    // Used in: ChatInputBar
    };
    modal: {
      minWidth: number;             // Used in: CustomAlert, LanguageSelector
      maxWidth: number;             // Used in: CustomAlert, LanguageSelector
      maxHeight: number;            // Used in: ChatHeader, LanguageSelector
    };
    drawer: {
      width: number;                // Used in: App layout
    };
    avatar: {
      small: number;                // Used in: Various avatar components
      medium: number;               // Used in: Various avatar components
      large: number;                // Used in: Various avatar components
    };
    icon: {
      small: number;                // Used in: ModelCapabilityIcons
      medium: number;               // Used in: Various icons
      large: number;                // Used in: Various icons
    };
    // Additional dimensions found in project
    card: {
      borderRadius: {
        small: number;              // Used in: Various cards
        medium: number;             // Used in: Various cards
        large: number;              // Used in: Various cards
        xlarge: number;             // Used in: Various cards
      };
    };
    button: {
      borderRadius: {
        small: number;              // Used in: Various buttons
        medium: number;             // Used in: Various buttons
        large: number;              // Used in: Various buttons
      };
    };
  };
  
  // Typography that can vary between themes
  typography: {
    lineHeights: {
      compact: number;              // Used in: CustomAlert, Auth pages
      normal: number;               // Used in: UserMessage
      relaxed: number;              // Used in: ChatHeader
    };
    // Additional typography found in project
    fontSizes: {
      tiny: number;                 // Used in: ModelCapabilityIcons
      small: number;                // Used in: Various components
      medium: number;               // Used in: Various components
      large: number;                // Used in: Various components
    };
  };
  
  // Spacing that can vary between themes
  spacing: {
    // Additional spacing values found in project
    xxs: number;                    // Used in: UserMessage
    xs: number;                     // Used in: Various components
    sm: number;                     // Used in: Various components
    md: number;                     // Used in: Various components
    lg: number;                     // Used in: Various components
    xl: number;                     // Used in: Various components
    xxl: number;                    // Used in: Various components
    xxxl: number;                   // Used in: Auth pages
  };
}

// Required shadow structure (ALL shadow properties used in project)
export interface RequiredShadows {
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
  // Additional shadow variants found in project
  button: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  card: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

// Required animation structure (ALL animation properties used in project)
export interface RequiredAnimations {
  durations: {
    fast: number;                   // Used in: Various animations
    normal: number;                 // Used in: Various animations
    slow: number;                   // Used in: Various animations
  };
  easings: {
    easeIn: string;                 // Used in: Various animations
    easeOut: string;                // Used in: Various animations
    easeInOut: string;              // Used in: Various animations
  };
}

// Base theme structure with ALL required properties
export interface BaseTheme {
  // Theme-managed properties (can vary between themes)
  colors: RequiredColors;               // ← ALL color properties (now theme-managed)
  spacing: RequiredSpacing;             // ← Moved from tokens.ts to theme management
  typography: RequiredTypography;       // ← Moved from tokens.ts to theme management
  borders: RequiredBorders;             // ← Combined border radius and border properties
  layout: RequiredLayout;               // ← ALL layout properties
  shadows: RequiredShadows;             // ← ALL shadow properties
  animations: RequiredAnimations;       // ← ALL animation properties
  zIndex: RequiredZIndex;               // ← NEW: Z-index control
  opacity: RequiredOpacity;             // ← NEW: Opacity control
  transforms: RequiredTransforms;       // ← NEW: Transform control
  transitions: RequiredTransitions;     // ← NEW: Transition control
  breakpoints: RequiredBreakpoints;     // ← NEW: Breakpoint control
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
export type PresentationTheme = BaseTheme;

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme style (which theme set to use)
export type ThemeStyle = string;

// ============================================================================
// THEME CONTEXT INTERFACES
// ============================================================================

/**
 * Theme context type
 */
export interface ThemeContextType {
  // Theme mode (light, dark, system)
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Theme style (which theme set to use, e.g., 'default', 'glassmorphism')
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
  
  // Current active theme based on mode and style
  currentTheme: BaseTheme;
  
  // Available themes for UI selection
  availableThemes: any; // ReturnType<typeof themeRegistry.getAllThemes>
  
  // Loading state to track when theme preferences are being loaded
  isLoading: boolean;
}
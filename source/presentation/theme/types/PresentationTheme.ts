/**
 * Presentation layer theme types
 * 
 * Re-exports business layer types with presentation-specific names
 * to maintain clean layer separation while providing type safety.
 */

// Re-export business types with presentation names
export type {
    AppTheme as PresentationTheme,
    ThemeMode,
    ThemeStyle
} from '../../../business/theme/constants/theme.types';

// Re-export service interfaces needed by presentation
export type { IThemeService } from '../../../service/theme/interfaces/IThemeService';

// Presentation-specific theme context interface
export interface PresentationThemeContext {
  /**
   * Current active theme based on mode and style
   */
  theme: PresentationTheme;
  
  /**
   * Current theme mode (light, dark, system)
   */
  mode: ThemeMode;
  
  /**
   * Current theme style (which theme set to use)
   */
  style: ThemeStyle;
  
  /**
   * Set theme mode with persistence
   */
  setMode: (mode: ThemeMode) => Promise<void>;
  
  /**
   * Set theme style with persistence
   */
  setStyle: (style: ThemeStyle) => Promise<void>;
  
  /**
   * Loading state for theme operations
   */
  isLoading: boolean;
  
  /**
   * Available themes for UI selection
   */
  availableThemes: ReturnType<IThemeService['getAllThemes']>;
}

/**
 * Presentation theme hook return type
 */
export interface UsePresentationThemeReturn {
  /**
   * Current theme object for styling
   */
  theme: PresentationTheme;
  
  /**
   * Current theme mode
   */
  mode: ThemeMode;
  
  /**
   * Current theme style
   */
  style: ThemeStyle;
  
  /**
   * Whether theme is loading
   */
  isLoading: boolean;
}

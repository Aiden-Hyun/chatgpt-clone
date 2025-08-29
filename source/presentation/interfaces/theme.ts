/**
 * Theme Presentation Interfaces
 * 
 * All theme-related interfaces for the presentation layer.
 */

import * as React from 'react';
import { BaseComponentProps } from './shared';

// ============================================================================
// THEME CONTEXT INTERFACES
// ============================================================================

/**
 * Theme mode types
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme style types
 */
export type ThemeStyle = string;

/**
 * Theme context interface
 */
export interface ThemeContextType {
  theme: any; // Will reference business layer theme
  mode: ThemeMode;
  style: ThemeStyle;
  setMode: (mode: ThemeMode) => Promise<void>;
  setStyle: (style: ThemeStyle) => Promise<void>;
  isLoading: boolean;
}

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
  initialStyle?: ThemeStyle;
}

// ============================================================================
// THEME COMPONENT INTERFACES
// ============================================================================

/**
 * Theme selector component props
 */
export interface ThemeSelectorProps extends BaseComponentProps {
  selectedTheme: ThemeStyle;
  onThemeChange: (theme: ThemeStyle) => void;
  availableThemes: ThemeOption[];
  showPreview?: boolean;
}

/**
 * Theme option interface
 */
export interface ThemeOption {
  id: string;
  name: string;
  description?: string;
  preview?: any;
  isAvailable: boolean;
}

/**
 * Theme settings section props
 */
export interface ThemeSettingsSectionProps extends BaseComponentProps {
  currentMode: ThemeMode;
  currentStyle: ThemeStyle;
  onModeChange: (mode: ThemeMode) => void;
  onStyleChange: (style: ThemeStyle) => void;
  availableThemes: ThemeOption[];
}

// ============================================================================
// THEME HOOK INTERFACES
// ============================================================================

/**
 * Theme hook return type
 */
export interface UseThemeReturn {
  theme: any;
  mode: ThemeMode;
  style: ThemeStyle;
  isLoading: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  setStyle: (style: ThemeStyle) => Promise<void>;
}

// ============================================================================
// THEME UTILITY INTERFACES
// ============================================================================

/**
 * Theme customization options
 */
export interface ThemeCustomization {
  primaryColor?: string;
  accentColor?: string;
  borderRadius?: number;
  spacing?: number;
  fontSize?: number;
}

/**
 * Theme preview interface
 */
export interface ThemePreview {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  preview: string; // Base64 image or URL
}

// theme.ts - Main theme file with enhanced theme switching support

import { PresentationTheme } from '../interfaces/theme';

import { useThemeContext } from './context/ThemeContext';
import { themeRegistry } from './themeRegistry';

// Re-export theme types
// Theme types moved to interfaces/theme.ts

// Re-export ThemeContext and provider
export { ThemeProvider, useThemeContext } from './context/ThemeContext';

// Re-export theme registry
export { themeRegistry };

/**
 * Hook to get the current theme based on user preferences
 * @returns The current theme object
 */
export function useTheme(): PresentationTheme {
  const { currentTheme } = useThemeContext();
  return currentTheme;
}

/**
 * Alias for useTheme for clarity and backward compatibility
 * @returns The current theme object
 */
export function useAppTheme(): PresentationTheme {
  return useTheme();
}

/**
 * Hook to get and set theme style (which theme set to use)
 * @returns Object with theme style and setter
 */
export function useThemeStyle() {
  const { themeStyle, setThemeStyle, availableThemes } = useThemeContext();
  return { themeStyle, setThemeStyle, availableThemes };
}

/**
 * Hook to get and set theme mode (light, dark, system)
 * @returns Object with theme mode and setter
 */
export function useThemeMode() {
  const { themeMode, setThemeMode } = useThemeContext();
  return { themeMode, setThemeMode };
}

// For backward compatibility, export the default theme
export const theme = {
  light: themeRegistry.getTheme('default')?.theme.light,
  dark: themeRegistry.getTheme('default')?.theme.dark,
};
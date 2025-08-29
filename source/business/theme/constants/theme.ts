// theme.ts - Main theme file with enhanced theme switching support

import { useThemeContext } from '../../../presentation/theme/context/ThemeContext';
import themeRegistry from '../../../presentation/theme/themeRegistry';
import { AppTheme } from './theme.types';

// Re-export theme types
export * from './theme.types';

// Re-export ThemeContext and provider
export { ThemeProvider, useThemeContext } from '../../../presentation/theme/context/ThemeContext';

// Re-export theme registry
export { themeRegistry } from '../../../presentation/theme/themeRegistry';

/**
 * Hook to get the current theme based on user preferences
 * @returns The current theme object
 */
export function useTheme(): AppTheme {
  const { currentTheme } = useThemeContext();
  return currentTheme;
}

/**
 * Alias for useTheme for clarity and backward compatibility
 * @returns The current theme object
 */
export function useAppTheme(): AppTheme {
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
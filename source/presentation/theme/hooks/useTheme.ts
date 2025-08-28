import { useThemeContext } from '../context/ThemeContext';
import { PresentationTheme } from '../types/PresentationTheme';

/**
 * Hook to get the current theme based on user preferences
 * @returns The current theme object for presentation layer components
 */
export function useTheme(): PresentationTheme {
  const { currentTheme } = useThemeContext();
  return currentTheme;
}

/**
 * Alias for useTheme for clarity and backward compatibility
 * @returns The current theme object for presentation layer components
 */
export function useAppTheme(): PresentationTheme {
  return useTheme();
}

/**
 * Hook to get complete theme context including mode, style, and actions
 * @returns The complete theme context for advanced theme management
 */
export function usePresentationTheme() {
  return useThemeContext();
}

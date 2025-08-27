import { AppTheme } from '../../../business/theme/constants/theme.types';
import { useThemeContext } from '../context/ThemeContext';

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

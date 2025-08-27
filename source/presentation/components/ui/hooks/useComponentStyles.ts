import { useTheme } from '../../../theme/hooks/useTheme';
import { useThemeStyle } from '../../../theme/hooks/useThemeStyle';
import { AppTheme } from '../../../../business/theme/constants/theme.types';

/**
 * Hook to provide consistent access to theme values for UI components
 * 
 * This hook wraps the theme hooks from the presentation layer to provide
 * a consistent way to access theme values across all UI components.
 */
export function useComponentStyles<T>(
  styleCreator: (theme: AppTheme) => T
): T {
  const theme = useTheme();
  return styleCreator(theme);
}

/**
 * Hook to access the theme directly for UI components
 * 
 * This is a convenience wrapper around the useTheme hook from the presentation layer
 */
export function useComponentTheme(): AppTheme {
  return useTheme();
}

/**
 * Hook to access theme styles for UI components
 * 
 * This is a convenience wrapper around the useThemeStyle hook from the presentation layer
 */
export function useComponentThemeStyle() {
  return useThemeStyle();
}

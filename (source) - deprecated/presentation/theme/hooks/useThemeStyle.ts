import { useThemeContext } from '../context/ThemeContext';

/**
 * Hook to get and set theme style (which theme set to use)
 * @returns Object with theme style and setter
 */
export function useThemeStyle() {
  const { themeStyle, setThemeStyle, availableThemes } = useThemeContext();
  return { themeStyle, setThemeStyle, availableThemes };
}

import { useThemeContext } from '../context/ThemeContext';

/**
 * Hook to get and set theme mode (light, dark, system)
 * @returns Object with theme mode and setter
 */
export function useThemeMode() {
  const { themeMode, setThemeMode } = useThemeContext();
  return { themeMode, setThemeMode };
}

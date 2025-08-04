import { useThemeContext } from '../../features/theme/context/ThemeContext';
import { theme } from '../../features/theme/lib/theme';

/**
 * Hook to get the current theme based on the selected theme mode
 * Provides access to all theme tokens (colors, spacing, typography, etc.)
 * 
 * @returns The current theme object with all design tokens
 * 
 * @example
 * ```tsx
 * const theme = useAppTheme();
 * 
 * return (
 *   <View style={{ 
 *     backgroundColor: theme.colors.background.primary,
 *     padding: theme.spacing.lg 
 *   }}>
 *     <Text style={{ 
 *       color: theme.colors.text.primary,
 *       fontSize: theme.fontSizes.md 
 *     }}>
 *       Hello World
 *     </Text>
 *   </View>
 * );
 * ```
 */
export function useAppTheme() {
  const { currentTheme } = useThemeContext();
  return theme[currentTheme];
}

export default useAppTheme; 
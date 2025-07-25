import { useTheme } from '../lib/theme';

/**
 * Hook to get the current theme based on the system color scheme
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
  return useTheme();
}

export default useAppTheme; 
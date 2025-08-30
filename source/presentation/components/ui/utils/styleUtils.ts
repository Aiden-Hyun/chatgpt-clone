import { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { PresentationTheme } from '../../../interfaces/theme';

/**
 * Merges multiple style objects into one
 * 
 * @param styles Array of style objects to merge
 * @returns Merged style object
 */
export function mergeStyles<T extends ViewStyle | TextStyle>(
  ...styles: (StyleProp<T> | undefined | false | null)[]
): StyleProp<T> {
  return styles.filter(Boolean);
}

/**
 * Creates a style object with conditional values
 * 
 * @param baseStyle Base style object
 * @param conditions Object with condition keys and style values
 * @returns Merged style object
 */
export function createConditionalStyles<T extends ViewStyle | TextStyle>(
  baseStyle: StyleProp<T>,
  conditions: Record<string, StyleProp<T> | boolean>
): StyleProp<T> {
  const styles = [baseStyle];
  
  Object.entries(conditions).forEach(([_unusedKey, value]) => {
    if (value && typeof value !== 'boolean') {
      styles.push(value);
    }
  });
  
  return styles;
}

/**
 * Creates responsive styles based on theme breakpoints
 * 
 * @param theme Current theme
 * @param styleCreator Function that creates styles based on breakpoint
 * @returns Style object
 */
export function createResponsiveStyles<T extends ViewStyle | TextStyle>(
  theme: PresentationTheme,
  styleCreator: (breakpoint: string) => StyleProp<T>
): StyleProp<T> {
  // This is a simplified implementation
  // In a real app, you would use the theme's breakpoints and current screen size
  const breakpoint = 'md'; // Default to medium breakpoint
  return styleCreator(breakpoint);
}

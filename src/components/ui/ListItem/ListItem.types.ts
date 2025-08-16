import { ReactNode } from 'react';
import { PressableProps } from 'react-native';

/**
 * ListItem variants for different use cases
 */
export type ListItemVariant = 
  | 'default'   // Standard list item
  | 'settings'  // Settings-style list item
  | 'chat'      // Chat room list item
  | 'menu';     // Menu item

/**
 * ListItem sizes
 */
export type ListItemSize = 
  | 'sm'    // Small
  | 'md'    // Medium (default)
  | 'lg';   // Large

/**
 * Props for the ListItem component
 */
export interface ListItemProps extends Omit<PressableProps, 'style'> {
  /**
   * ListItem variant that determines the visual style
   * @default 'default'
   */
  variant?: ListItemVariant;
  
  /**
   * ListItem size that determines dimensions and padding
   * @default 'md'
   */
  size?: ListItemSize;
  
  /**
   * Primary text to display
   */
  title: string;
  
  /**
   * Secondary text to display below the title
   */
  subtitle?: string;
  
  /**
   * Tertiary text to display (e.g., timestamp)
   */
  description?: string;
  
  /**
   * Element to display on the left side of the item (e.g., avatar, icon)
   */
  leftElement?: ReactNode;
  
  /**
   * Element to display on the right side of the item (e.g., chevron, badge)
   */
  rightElement?: ReactNode;
  
  /**
   * Whether the item is currently selected
   * @default false
   */
  selected?: boolean;
  
  /**
   * Whether to show a border at the bottom of the item
   * @default true
   */
  showBorder?: boolean;
  
  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Optional style overrides for the item container
   */
  containerStyle?: PressableProps['style'];
  
  /**
   * Optional style overrides for the title text
   */
  titleStyle?: PressableProps['style'];
  
  /**
   * Optional style overrides for the subtitle text
   */
  subtitleStyle?: PressableProps['style'];
  
  /**
   * Optional style overrides for the description text
   */
  descriptionStyle?: PressableProps['style'];
}

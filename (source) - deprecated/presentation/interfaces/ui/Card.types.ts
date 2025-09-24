import { ReactNode } from 'react';
import { ViewProps } from 'react-native';

/**
 * Card variants for different visual styles
 */
export type CardVariant = 
  | 'default'   // Standard card with subtle shadow
  | 'elevated'  // Card with more pronounced shadow
  | 'outlined'  // Card with border and no shadow
  | 'flat';     // Card with no shadow or border, just background color

/**
 * Card padding sizes
 */
export type CardPadding = 
  | 'none'   // No padding
  | 'sm'     // Small padding
  | 'md'     // Medium padding (default)
  | 'lg';    // Large padding

/**
 * Props for the Card component
 */
export interface CardProps extends Omit<ViewProps, 'style'> {
  /**
   * Card variant that determines the visual style
   * @default 'default'
   */
  variant?: CardVariant;
  
  /**
   * Padding size for the card content
   * @default 'md'
   */
  padding?: CardPadding;
  
  /**
   * Whether the card should take full width of its container
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * Optional header content
   */
  header?: ReactNode;
  
  /**
   * Optional footer content
   */
  footer?: ReactNode;
  
  /**
   * Whether the card is pressable
   * @default false
   */
  pressable?: boolean;
  
  /**
   * Function to call when the card is pressed
   * Only used when pressable is true
   */
  onPress?: () => void;
  
  /**
   * Optional style overrides for the card container
   */
  containerStyle?: ViewProps['style'];
  
  /**
   * Optional style overrides for the card content
   */
  contentStyle?: ViewProps['style'];
  
  /**
   * Optional style overrides for the card header
   */
  headerStyle?: ViewProps['style'];
  
  /**
   * Optional style overrides for the card footer
   */
  footerStyle?: ViewProps['style'];
  
  /**
   * Children elements to render inside the card
   */
  children: ReactNode;
}

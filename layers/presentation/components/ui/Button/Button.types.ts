import { ReactNode } from 'react';
import { TouchableOpacityProps } from 'react-native';

/**
 * Button variants define the visual style of the button
 */
export type ButtonVariant = 
  | 'primary'    // Main action buttons (solid background, light text)
  | 'secondary'  // Alternative action buttons (lighter background)
  | 'outline'    // Bordered buttons with transparent background
  | 'ghost'      // No background or border, just text color
  | 'link';      // Looks like a text link

/**
 * Button sizes determine the padding, font size, etc.
 */
export type ButtonSize = 
  | 'xs'     // Extra small
  | 'sm'     // Small
  | 'md'     // Medium (default)
  | 'lg'     // Large
  | 'xl';    // Extra large

/**
 * Status colors for buttons
 */
export type ButtonStatus = 
  | 'default'  // Default color from theme
  | 'success'  // Green for success actions
  | 'error'    // Red for destructive actions
  | 'warning'  // Yellow/orange for caution actions
  | 'info';    // Blue for informational actions

/**
 * Props for the Button component
 */
export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Button variant that determines the visual style
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size that determines dimensions and padding
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Status color for the button
   * @default 'default'
   */
  status?: ButtonStatus;
  
  /**
   * Button label text
   */
  label?: string;
  
  /**
   * Icon to display before the label
   */
  leftIcon?: ReactNode;
  
  /**
   * Icon to display after the label
   */
  rightIcon?: ReactNode;
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Text to display when button is in loading state
   */
  loadingText?: string;
  
  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Optional style overrides for the button container
   */
  containerStyle?: TouchableOpacityProps['style'];
  
  /**
   * Optional style overrides for the button text
   */
  textStyle?: TouchableOpacityProps['style'];
  
  /**
   * Children elements (alternative to label)
   */
  children?: ReactNode;
}

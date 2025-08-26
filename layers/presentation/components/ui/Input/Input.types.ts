import { ReactNode } from 'react';
import { TextInputProps } from 'react-native';

/**
 * Input variants for different use cases
 */
export type InputVariant = 
  | 'default'   // Standard input field
  | 'filled'    // Input with background fill
  | 'outlined'  // Input with outline border
  | 'underlined' // Input with only bottom border
  | 'search'    // Search input with search icon
  | 'chat';     // Chat message input

/**
 * Input sizes
 */
export type InputSize = 
  | 'sm'    // Small
  | 'md'    // Medium (default)
  | 'lg';   // Large

/**
 * Input status for validation states
 */
export type InputStatus = 
  | 'default'  // Default state
  | 'success'  // Valid input
  | 'error'    // Invalid input
  | 'warning'; // Warning state

/**
 * Props for the Input component
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input variant that determines the visual style
   * @default 'default'
   */
  variant?: InputVariant;
  
  /**
   * Input size that determines dimensions and padding
   * @default 'md'
   */
  size?: InputSize;
  
  /**
   * Status for validation feedback
   * @default 'default'
   */
  status?: InputStatus;
  
  /**
   * Label text to display above the input
   */
  label?: string;
  
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  
  /**
   * Error message to display when status is 'error'
   */
  errorText?: string;
  
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: ReactNode;
  
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: ReactNode;
  
  /**
   * Whether the input should take full width of its container
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * Optional style overrides for the input container
   */
  containerStyle?: TextInputProps['style'];
  
  /**
   * Optional style overrides for the input field
   */
  inputStyle?: TextInputProps['style'];
  
  /**
   * Optional style overrides for the label
   */
  labelStyle?: TextInputProps['style'];
  
  /**
   * Optional style overrides for helper/error text
   */
  helperTextStyle?: TextInputProps['style'];
}

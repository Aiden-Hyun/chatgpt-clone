import { TextProps as RNTextProps } from 'react-native';

/**
 * Text variants for different semantic purposes
 */
export type TextVariant = 
  | 'h1'        // Heading 1
  | 'h2'        // Heading 2
  | 'h3'        // Heading 3
  | 'title'     // Page or section title
  | 'subtitle'  // Secondary title
  | 'body'      // Regular body text (default)
  | 'caption'   // Smaller text for captions
  | 'label'     // Form labels
  | 'link'      // Clickable text links
  | 'error'     // Error messages
  | 'code';     // Code snippets

/**
 * Text weights
 */
export type TextWeight = 
  | 'regular'   // Normal weight (400)
  | 'medium'    // Medium weight (500)
  | 'semibold'  // Semi-bold weight (600)
  | 'bold';     // Bold weight (700)

/**
 * Text sizes
 */
export type TextSize = 
  | 'xs'    // Extra small
  | 'sm'    // Small
  | 'md'    // Medium (default)
  | 'lg'    // Large
  | 'xl'    // Extra large
  | 'xxl';  // Extra extra large

/**
 * Props for the Text component
 */
export interface TextProps extends Omit<RNTextProps, 'style'> {
  /**
   * Text variant that determines the semantic styling
   * @default 'body'
   */
  variant?: TextVariant;
  
  /**
   * Text weight
   * @default depends on variant
   */
  weight?: TextWeight;
  
  /**
   * Text size
   * @default depends on variant
   */
  size?: TextSize;
  
  /**
   * Whether the text should be centered
   * @default false
   */
  center?: boolean;
  
  /**
   * Whether the text should be right-aligned
   * @default false
   */
  right?: boolean;
  
  /**
   * Whether the text should be italic
   * @default false
   */
  italic?: boolean;
  
  /**
   * Whether the text should be underlined
   * @default false for most variants, true for 'link'
   */
  underline?: boolean;
  
  /**
   * Color of the text
   * If not provided, uses the default color for the variant from theme
   */
  color?: string;
  
  /**
   * Number of lines before truncating with ellipsis
   */
  numberOfLines?: number;
  
  /**
   * Optional style overrides
   */
  style?: RNTextProps['style'];
}

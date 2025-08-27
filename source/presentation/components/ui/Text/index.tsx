import React from 'react';
import { Text as RNText } from 'react-native';
import { useComponentStyles } from '../hooks/useComponentStyles';
import createTextStyles from './Text.styles';
import { TextProps } from './Text.types';

/**
 * Text component that supports various styles, sizes, and semantic variants.
 * 
 * @example
 * // Body text (default)
 * <Text>This is regular body text</Text>
 * 
 * @example
 * // Heading
 * <Text variant="h1">Page Title</Text>
 * 
 * @example
 * // Error message
 * <Text variant="error">Something went wrong</Text>
 * 
 * @example
 * // Custom styling
 * <Text size="lg" weight="bold" color="#ff0000">Important message</Text>
 */
export const Text = ({
  variant = 'body',
  weight,
  size,
  center = false,
  right = false,
  italic = false,
  underline,
  color,
  style,
  children,
  ...rest
}: TextProps) => {
  const styles = useComponentStyles(createTextStyles);

  // Default underline value for links
  const shouldUnderline = underline ?? (variant === 'link');

  // Combine styles based on props
  const textStyle = [
    styles.text,
    styles.getVariantStyle(variant),
    // Only apply size and weight if explicitly provided (otherwise use variant defaults)
    size && styles.getSizeStyle(size),
    weight && styles.getWeightStyle(weight),
    center && styles.center,
    right && styles.right,
    italic && styles.italic,
    shouldUnderline && styles.underline,
    color && { color },
    style,
  ];

  return (
    <RNText style={textStyle} {...rest}>
      {children}
    </RNText>
  );
};

export default Text;

import React from 'react';
import { Pressable, View } from 'react-native';
import { useComponentStyles } from '../hooks/useComponentStyles';
import createCardStyles from './Card.styles';
import { CardProps } from './Card.types';

/**
 * Card component for containing related content with various visual styles.
 * 
 * @example
 * // Basic card
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 * 
 * @example
 * // Elevated card with header and footer
 * <Card 
 *   variant="elevated"
 *   header={<Text style={{fontWeight: 'bold'}}>Card Title</Text>}
 *   footer={<Button label="Action" size="sm" />}
 * >
 *   <Text>This is the main content of the card.</Text>
 * </Card>
 * 
 * @example
 * // Pressable card
 * <Card pressable onPress={() => console.log('Card pressed')}>
 *   <Text>Tap me!</Text>
 * </Card>
 */
export const Card = ({
  variant = 'default',
  padding = 'md',
  fullWidth = true,
  header,
  footer,
  pressable = false,
  onPress,
  containerStyle,
  contentStyle,
  headerStyle,
  footerStyle,
  children,
  ...rest
}: CardProps) => {
  const styles = useComponentStyles(createCardStyles);

  // Combine styles based on props
  const cardStyle = [
    styles.card,
    styles.getVariantStyle(variant),
    fullWidth && styles.fullWidth,
    containerStyle,
  ];

  const contentStyles = [
    styles.content,
    styles.getPaddingStyle(padding),
    contentStyle,
  ];

  // Render the card content
  const renderContent = () => (
    <>
      {header && (
        <View style={[styles.header, headerStyle]}>
          {header}
        </View>
      )}
      
      <View style={contentStyles}>
        {children}
      </View>
      
      {footer && (
        <View style={[styles.footer, footerStyle]}>
          {footer}
        </View>
      )}
    </>
  );

  // If the card is pressable, wrap content in a Pressable
  if (pressable) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressableHighlight,
        ]}
        onPress={onPress}
        {...rest}
      >
        {renderContent()}
      </Pressable>
    );
  }

  // Otherwise render as a regular View
  return (
    <View style={cardStyle} {...rest}>
      {renderContent()}
    </View>
  );
};

export default Card;

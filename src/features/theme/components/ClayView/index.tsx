import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';

export interface ClayViewProps {
  /**
   * The elevation level of the clay effect.
   * Higher values create more pronounced 3D effects.
   * Default is 2.
   */
  elevation?: 1 | 2 | 3 | 4;
  
  /**
   * The background color of the clay element.
   * Default is determined by the theme.
   */
  backgroundColor?: string;
  
  /**
   * Whether to use the pressed state appearance.
   * Creates an inset/pressed effect when true.
   * Default is false.
   */
  pressed?: boolean;
  
  /**
   * Additional styles for the container.
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Children to render inside the clay view.
   */
  children?: React.ReactNode;
  
  /**
   * Whether to add inner shadow effect.
   * Default is true.
   */
  innerShadow?: boolean;
  
  /**
   * Whether to add outer shadow effect.
   * Default is true.
   */
  outerShadow?: boolean;
}

/**
 * A component that creates a claymorphism effect with soft, puffy 3D appearance.
 */
export const ClayView: React.FC<ClayViewProps> = ({
  elevation = 2,
  backgroundColor,
  pressed = false,
  style,
  children,
  innerShadow = true,
  outerShadow = true,
}) => {
  const theme = useAppTheme();
  
  // Determine background color based on theme if not explicitly provided
  const effectiveBackgroundColor = backgroundColor || 
    (theme.colors.claymorphism?.background || theme.colors.background.primary);
  
  // Calculate shadow properties based on elevation
  const shadowSize = elevation * 4;
  const shadowOpacity = 0.15 + (elevation * 0.05);
  const shadowRadius = elevation * 3;
  const shadowOffset = elevation * 2;
  
  // Determine shadow colors based on theme
  const shadowColor = theme.colors.claymorphism?.shadow || 'rgba(0, 0, 0, 0.3)';
  const highlightColor = theme.colors.claymorphism?.highlight || 'rgba(255, 255, 255, 0.7)';
  
  // Create styles for the clay effect
  const clayStyles = StyleSheet.create({
    container: {
      backgroundColor: effectiveBackgroundColor,
      borderRadius: theme.borders.radius.xl * 1.5, // Extra rounded corners for clay effect
      overflow: 'hidden',
      position: 'relative',
    },
    // Outer shadows - creates the raised clay effect
    outerShadow1: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.borders.radius.xl * 1.5,
      shadowColor,
      shadowOffset: { 
        width: pressed ? -shadowOffset : shadowOffset, 
        height: pressed ? -shadowOffset : shadowOffset 
      },
      shadowOpacity,
      shadowRadius,
      elevation: pressed ? 0 : elevation,
    },
    outerShadow2: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.borders.radius.xl * 1.5,
      shadowColor,
      shadowOffset: { 
        width: pressed ? shadowOffset : -shadowOffset, 
        height: pressed ? shadowOffset : -shadowOffset 
      },
      shadowOpacity: shadowOpacity * 0.7,
      shadowRadius: shadowRadius * 0.7,
      elevation: pressed ? 0 : elevation * 0.7,
    },
    // Inner shadows - creates the soft, puffy look
    innerShadow1: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.borders.radius.xl * 1.5,
      backgroundColor: 'transparent',
      borderWidth: theme.borders.widths.thin,
      borderColor: pressed ? shadowColor : highlightColor,
      borderBottomWidth: pressed ? 0 : theme.borders.widths.medium,
      borderRightWidth: pressed ? 0 : theme.borders.widths.medium,
      borderTopWidth: pressed ? theme.borders.widths.medium : 0,
      borderLeftWidth: pressed ? theme.borders.widths.medium : 0,
      opacity: theme.opacity.subtle,
    },
    innerShadow2: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.borders.radius.xl * 1.5,
      backgroundColor: 'transparent',
      borderWidth: theme.borders.widths.thin,
      borderColor: pressed ? highlightColor : shadowColor,
      borderBottomWidth: pressed ? theme.borders.widths.medium : 0,
      borderRightWidth: pressed ? theme.borders.widths.medium : 0,
      borderTopWidth: pressed ? 0 : theme.borders.widths.medium,
      borderLeftWidth: pressed ? 0 : theme.borders.widths.medium,
      opacity: theme.opacity.ghost,
    },
    // Content container
    content: {
      overflow: 'hidden',
      borderRadius: theme.borders.radius.xl * 1.5,
    },
  });

  return (
    <View style={[clayStyles.container, style]}>
      {/* Outer shadows */}
      {outerShadow && (
        <>
          <View style={clayStyles.outerShadow1} />
          <View style={clayStyles.outerShadow2} />
        </>
      )}
      
      {/* Content */}
      <View style={clayStyles.content}>
        {children}
      </View>
      
      {/* Inner shadows */}
      {innerShadow && (
        <>
          <View style={clayStyles.innerShadow1} pointerEvents="none" />
          <View style={clayStyles.innerShadow2} pointerEvents="none" />
        </>
      )}
    </View>
  );
};

export default ClayView;

import { BlurView as ExpoBlurView } from 'expo-blur';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';

export interface BlurViewProps {
  /**
   * The intensity of the blur effect. A value from 1 to 100.
   * Default is 50.
   */
  intensity?: number;
  
  /**
   * The tint color of the blur effect.
   * Default is determined by the theme.
   */
  tintColor?: string;
  
  /**
   * The opacity of the tint color.
   * Default is 0.3.
   */
  tintOpacity?: number;
  
  /**
   * Whether to use the light or dark blur effect.
   * If not specified, it will be determined by the theme.
   */
  blurType?: 'light' | 'dark';
  
  /**
   * Additional styles for the container.
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Whether to add a subtle border to enhance the glass effect.
   * Default is true.
   */
  withBorder?: boolean;
  
  /**
   * Children to render inside the blur view.
   */
  children?: React.ReactNode;
}

/**
 * A component that creates a glassmorphism effect using the Expo BlurView.
 */
export const BlurView: React.FC<BlurViewProps> = ({
  intensity = 50,
  tintColor,
  tintOpacity = 0.3,
  blurType,
  style,
  withBorder = true,
  children,
}) => {
  const { themeMode, currentTheme } = useThemeContext();
  
  // Determine blur type based on theme if not explicitly provided
  const effectiveBlurType = blurType || (themeMode === 'dark' || 
    (themeMode === 'system' && currentTheme.colors.background.primary === '#1A202C') 
    ? 'dark' : 'light');
  
  // Determine tint color based on theme if not explicitly provided
  const effectiveTintColor = tintColor || (effectiveBlurType === 'dark' 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(255, 255, 255, 0.3)');
  
  // Border color based on blur type
  const borderColor = effectiveBlurType === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.3)';
  
  return (
    <ExpoBlurView
      intensity={intensity}
      tint={effectiveBlurType}
      style={[
        styles.blur,
        withBorder && { borderColor, borderWidth: StyleSheet.hairlineWidth },
        style,
      ]}
    >
      {/* Apply tint color overlay */}
      {tintOpacity > 0 && (
        <View 
          style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: effectiveTintColor, opacity: tintOpacity }
          ]} 
        />
      )}
      
      {/* Content */}
      {children}
    </ExpoBlurView>
  );
};

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
    borderRadius: 8,
  },
});

export default BlurView;

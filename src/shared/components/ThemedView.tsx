import { View, type ViewProps } from 'react-native';

import { useTheme } from '../lib/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'card' | 'elevated';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'primary',
  ...otherProps 
}: ThemedViewProps) {
  const theme = useTheme();
  
  // Use provided colors or fall back to theme colors
  const backgroundColor = lightColor || darkColor || theme.colors.background[variant];

  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return {
          backgroundColor,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.light,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        };
      case 'elevated':
        return {
          backgroundColor,
          borderRadius: theme.borderRadius.md,
          ...theme.shadows.medium,
        };
      default:
        return { backgroundColor };
    }
  };

  return <View style={[getVariantStyles(), style]} {...otherProps} />;
}

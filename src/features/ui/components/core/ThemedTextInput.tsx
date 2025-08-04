import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../../../theme/lib/theme';

export interface ThemedTextInputProps extends TextInputProps {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

export const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  size = 'medium',
  ...rest
}, ref) => {
  const theme = useTheme();
  
  // Use provided colors or fall back to theme colors
  const textColor = lightColor || darkColor || theme.colors.text.primary;
  const backgroundColor = theme.colors.background.primary;

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 0,
          borderRadius: theme.borderRadius.md,
          ...theme.shadows.light,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border.medium,
          borderRadius: theme.borderRadius.md,
        };
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.light,
          borderRadius: 0,
        };
      default:
        return {
          backgroundColor,
          borderWidth: 1,
          borderColor: theme.colors.border.medium,
          borderRadius: theme.borderRadius.md,
          ...theme.shadows.light,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 36,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.fontSizes.sm,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: theme.spacing.lg,
          fontSize: theme.fontSizes.lg,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.fontSizes.md,
        };
    }
  };

  return (
    <TextInput
      ref={ref}
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        {
          color: textColor,
          fontFamily: theme.fontFamily.primary,
          fontWeight: theme.fontWeights.regular,
        },
        style,
      ]}
      placeholderTextColor={theme.colors.text.tertiary}
      {...rest}
    />
  );
});

ThemedTextInput.displayName = 'ThemedTextInput';

const styles = StyleSheet.create({
  base: {
    width: '100%',
    marginBottom: 12,
  },
}); 
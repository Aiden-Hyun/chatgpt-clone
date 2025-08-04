import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { useTheme } from '../../theme/lib/theme';
import { ThemedText } from './ThemedText';

export interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  style,
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...rest
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border.medium,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.status.error.primary,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.sm,
        };
      case 'large':
        return {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
        };
      default:
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.text.tertiary;
    
    switch (variant) {
      case 'primary':
      case 'danger':
        return theme.colors.text.inverted;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return theme.colors.text.primary;
      default:
        return theme.colors.text.inverted;
    }
  };

  const getDisabledStyles = () => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.background.tertiary,
        borderColor: theme.colors.border.light,
        opacity: 0.6,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        getDisabledStyles(),
        theme.shadows.light,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      <View style={styles.content}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        {loading ? (
          <ThemedText
            type="button"
            style={[styles.text, { color: getTextColor() }]}
          >
            Loading...
          </ThemedText>
        ) : (
          <ThemedText
            type="button"
            style={[styles.text, { color: getTextColor() }]}
          >
            {children}
          </ThemedText>
        )}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
}); 
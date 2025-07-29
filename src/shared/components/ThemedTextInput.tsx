import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export interface ThemedTextInputProps extends TextInputProps {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'filled';
}

export const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...rest
}, ref) => {
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <TextInput
      ref={ref}
      style={[
        styles.base,
        variant === 'filled' && styles.filled,
        {
          color: textColor,
          backgroundColor: variant === 'filled' ? backgroundColor : undefined,
        },
        style,
      ]}
      placeholderTextColor={useThemeColor({}, 'icon')}
      {...rest}
    />
  );
});

ThemedTextInput.displayName = 'ThemedTextInput';

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  filled: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
  },
}); 
import React, { forwardRef } from "react";
import { Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/features/theme";

import { createInputStyles } from "./Input.styles";
import { InputProps } from "./Input.types";

/**
 * Input component that supports various styles, sizes, and validation states.
 *
 * @example
 * // Default input
 * <Input placeholder="Enter your name" />
 *
 * @example
 * // Filled input with label
 * <Input
 *   label="Email"
 *   variant="filled"
 *   placeholder="Enter your email"
 *   keyboardType="email-address"
 * />
 *
 * @example
 * // Input with validation
 * <Input
 *   label="Password"
 *   variant="outlined"
 *   placeholder="Enter your password"
 *   secureTextEntry
 *   status={isValid ? 'success' : 'error'}
 *   errorText={isValid ? '' : 'Password must be at least 8 characters'}
 * />
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      variant = "default",
      size = "md",
      status = "default",
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      containerStyle,
      inputStyle,
      labelStyle,
      helperTextStyle,
      editable = true,
      ...rest
    },
    ref
  ) => {
    const theme = useAppTheme();
    const styles = createInputStyles(theme);

    // Determine if we should show an error message
    const showError = status === "error" && errorText;

    // Determine which helper text to show
    const displayHelperText = showError ? errorText : helperText;

    // Combine styles based on props
    const containerStyles = [
      styles.container,
      fullWidth && styles.fullWidth,
      !editable && styles.disabled,
      containerStyle,
    ];

    const inputStyles = [
      styles.input,
      styles.sizes[size],
      styles.getVariantStyle(variant, status),
      leftIcon && styles.inputWithLeftIcon,
      rightIcon && styles.inputWithRightIcon,
      inputStyle,
    ];

    return (
      <View style={containerStyles}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

        <View style={{ position: "relative" }}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={inputStyles}
            placeholderTextColor={theme.colors.text.quaternary}
            editable={editable}
            {...rest}
          />

          {rightIcon && (
            <View style={styles.rightIconContainer}>{rightIcon}</View>
          )}
        </View>

        {displayHelperText && (
          <Text
            style={[
              showError ? styles.errorText : styles.helperText,
              helperTextStyle,
            ]}
          >
            {displayHelperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

export default Input;

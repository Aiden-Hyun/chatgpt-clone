import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import createButtonStyles from './Button.styles';
import { ButtonProps } from './Button.types';

/**
 * Button component that supports various styles, sizes, and states.
 * 
 * @example
 * // Primary button (default)
 * <Button label="Submit" onPress={handleSubmit} />
 * 
 * @example
 * // Outline button with error status
 * <Button 
 *   variant="outline" 
 *   status="error" 
 *   label="Delete" 
 *   onPress={handleDelete} 
 * />
 * 
 * @example
 * // Button with loading state
 * <Button 
 *   label="Save" 
 *   isLoading={isSaving}
 *   loadingText="Saving..."
 *   onPress={handleSave} 
 * />
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  status = 'default',
  label,
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled = false,
  containerStyle,
  textStyle,
  children,
  ...rest
}: ButtonProps) => {
  const theme = useAppTheme();
  const styles = createButtonStyles(theme);

  // Combine styles based on props
  const buttonStyle = [
    styles.button,
    styles.sizes[size],
    styles.getVariantStyle(variant, status),
    fullWidth && styles.fullWidth,
    (disabled || isLoading) && styles.disabled,
    containerStyle,
  ];

  // Text style based on variant and size
  const buttonTextStyle = [
    styles.getTextStyle(variant, status, size),
    textStyle,
  ];

  // Determine what to render inside the button
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator 
            size={size === 'xs' || size === 'sm' ? 'small' : 'small'} 
            color={variant === 'primary' ? theme.colors.text.inverted : theme.colors.primary} 
          />
          {loadingText && (
            <Text style={[buttonTextStyle, { marginLeft: theme.spacing.sm }]}>
              {loadingText}
            </Text>
          )}
        </View>
      );
    }

    // If children are provided, render them (for custom content)
    if (children) {
      return children;
    }

    // Otherwise, render label with icons
    return (
      <>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        {label && <Text style={buttonTextStyle}>{label}</Text>}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default Button;

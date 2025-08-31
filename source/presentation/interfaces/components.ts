/**
 * Component Presentation Interfaces
 * 
 * All UI component prop interfaces for the presentation layer.
 */

import * as React from 'react';
import { PressableProps, TextProps as RNTextProps, TextInputProps, TouchableOpacityProps } from 'react-native';

import { BaseComponentProps, ComponentSize, ILogger } from './shared';

// ============================================================================
// BUTTON INTERFACES
// ============================================================================

/**
 * Button size variants
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button status variants
 */
export type ButtonStatus = 'default' | 'loading' | 'disabled';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';

/**
 * Button component props
 */
export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'>, BaseComponentProps {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  status?: ButtonStatus;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

// ============================================================================
// TEXT INTERFACES
// ============================================================================

/**
 * Text size variants
 */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Text variant types
 */
export type TextVariant = 'body' | 'heading' | 'subheading' | 'caption' | 'label';

/**
 * Text weight types
 */
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Text component props
 */
export interface TextProps extends Omit<RNTextProps, 'style'>, BaseComponentProps {
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

// ============================================================================
// INPUT INTERFACES
// ============================================================================

/**
 * Input size variants
 */
export type InputSize = 'small' | 'medium' | 'large';

/**
 * Input status variants
 */
export type InputStatus = 'default' | 'error' | 'success' | 'warning';

/**
 * Input variant types
 */
export type InputVariant = 'outline' | 'filled' | 'underline';

/**
 * Input component props
 */
export interface InputProps extends Omit<TextInputProps, 'style'>, BaseComponentProps {
  label?: string;
  error?: string;
  hint?: string;
  variant?: InputVariant;
  size?: InputSize;
  status?: InputStatus;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

// ============================================================================
// CARD INTERFACES
// ============================================================================

/**
 * Card variant types
 */
export type CardVariant = 'elevated' | 'outlined' | 'filled';

/**
 * Card padding variants
 */
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

/**
 * Card component props
 */
export interface CardProps extends BaseComponentProps {
  variant?: CardVariant;
  padding?: CardPadding;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

// ============================================================================
// LIST INTERFACES
// ============================================================================

/**
 * List item size variants
 */
export type ListItemSize = 'small' | 'medium' | 'large';

/**
 * List item variant types
 */
export type ListItemVariant = 'default' | 'card' | 'inset';

/**
 * List item component props
 */
export interface ListItemProps extends Omit<PressableProps, 'style'>, BaseComponentProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  variant?: ListItemVariant;
  size?: ListItemSize;
  disabled?: boolean;
  selected?: boolean;
}

// ============================================================================
// DROPDOWN INTERFACES
// ============================================================================

/**
 * Dropdown item interface
 */
export interface DropdownItem {
  id: string;
  label: string;
  value: any;
  icon?: React.ReactNode;
  disabled?: boolean;
  separator?: boolean;
}

/**
 * Dropdown component props
 */
export interface DropdownProps extends BaseComponentProps {
  items: DropdownItem[];
  selectedValue?: any;
  onSelect: (item: DropdownItem) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
}

// ============================================================================
// MODAL INTERFACES
// ============================================================================

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: React.ReactNode;
}

// ============================================================================
// LOADING INTERFACES
// ============================================================================

/**
 * Loading component props
 */
export interface LoadingProps extends BaseComponentProps {
  size?: ComponentSize;
  color?: string;
  text?: string;
  overlay?: boolean;
}

/**
 * Loading wrapper props
 */
export interface LoadingWrapperProps extends BaseComponentProps {
  loading: boolean;
  loadingText?: string;
  error?: string;
  onRetry?: () => void;
}

// ============================================================================
// LOGO INTERFACES
// ============================================================================

/**
 * Anthropic logo props
 */
export interface AnthropicLogoProps {
  size?: number;
}

/**
 * Form wrapper props
 */
export interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  style?: Record<string, unknown>;
}

/**
 * Loading screen props
 */
export interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

/**
 * OpenAI logo props
 */
export interface OpenAILogoProps {
  size?: number;
  variant?: 'white' | 'black';
}

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

/**
 * Interface for UI component-specific context
 */
export interface ComponentsContextValue {
  logger: ILogger;
}

/**
 * Props for ComponentsProvider
 */
export interface ComponentsProviderProps {
  children: ReactNode;
}

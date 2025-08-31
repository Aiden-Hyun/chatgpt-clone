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

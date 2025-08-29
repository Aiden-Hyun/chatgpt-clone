/**
 * Shared Presentation Interfaces
 * 
 * Common interfaces used across multiple presentation domains.
 */

import * as React from 'react';

// ============================================================================
// BASE COMPONENT INTERFACES
// ============================================================================

/**
 * Base props for all presentation components
 */
export interface BaseComponentProps {
  children?: React.ReactNode;
  testID?: string;
  style?: any;
  className?: string;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

/**
 * Error state interface
 */
export interface ErrorState {
  hasError: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Combined component state
 */
export interface ComponentState extends LoadingState, ErrorState {
  isVisible: boolean;
  isDisabled: boolean;
}

// ============================================================================
// EVENT HANDLER INTERFACES
// ============================================================================

export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;
export type AsyncEventHandler<T = void> = () => Promise<T>;
export type AsyncEventHandlerWithParam<P, T = void> = (param: P) => Promise<T>;

// ============================================================================
// FORM INTERFACES
// ============================================================================

/**
 * Form field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

/**
 * Form field state
 */
export interface FieldState<T = any> {
  value: T;
  error?: string;
  warning?: string;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
}

/**
 * Form state
 */
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string>;
  warnings: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ============================================================================
// UI UTILITY INTERFACES
// ============================================================================

/**
 * Component size variants
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * Component variant types
 */
export type ComponentVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'info';

/**
 * Component alignment types
 */
export type ComponentAlignment = 'left' | 'center' | 'right';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Responsive breakpoint types
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Responsive value type
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// ============================================================================
// NAVIGATION INTERFACES
// ============================================================================

/**
 * Navigation options
 */
export interface NavigationOptions {
  replace?: boolean;
  params?: Record<string, string>;
  state?: any;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  protected?: boolean;
}

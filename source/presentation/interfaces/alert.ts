/**
 * Alert Presentation Interfaces
 * 
 * All alert, toast, and notification interfaces for the presentation layer.
 */

import * as React from 'react';

import { BaseComponentProps } from './shared';

// ============================================================================
// TOAST INTERFACES
// ============================================================================

/**
 * Toast message types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast state interface (extracted from ToastContext.tsx)
 */
export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

/**
 * Toast context interface (extracted from ToastContext.tsx)
 */
export interface ToastContextType {
  toast: ToastState;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

/**
 * Toast provider props (extracted from ToastContext.tsx)
 */
export interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Toast component props
 */
export interface ToastProps extends BaseComponentProps {
  message: string;
  type: ToastType;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  onPress?: () => void;
  position?: 'top' | 'bottom';
}

// ============================================================================
// ALERT DIALOG INTERFACES
// ============================================================================

/**
 * Custom alert props interface
 */
export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Alert state interface for useCustomAlert hook
 */
export interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText: string;
  cancelText: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

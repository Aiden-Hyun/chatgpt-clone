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
  onHide: () => void;
  position?: 'top' | 'bottom' | 'center';
}

// ============================================================================
// ALERT DIALOG INTERFACES
// ============================================================================

/**
 * Alert dialog props
 */
export interface AlertDialogProps extends BaseComponentProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: ToastType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

/**
 * Alert context interface
 */
export interface AlertContextType {
  showAlert: (props: Omit<AlertDialogProps, 'visible'>) => void;
  hideAlert: () => void;
  isVisible: boolean;
}

/**
 * Alert provider props
 */
export interface AlertProviderProps {
  children: React.ReactNode;
}

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

/**
 * Notification action interface
 */
export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style?: 'default' | 'destructive';
}

/**
 * Notification center props
 */
export interface NotificationCenterProps extends BaseComponentProps {
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  onNotificationDismiss: (id: string) => void;
  onActionPress: (notificationId: string, actionId: string) => void;
}

// ============================================================================
// ALERT HOOK INTERFACES
// ============================================================================

/**
 * Toast hook return type
 */
export interface UseToastReturn {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideToast: () => void;
  isVisible: boolean;
}

/**
 * Alert hook return type
 */
export interface UseAlertReturn {
  showAlert: (props: Omit<AlertDialogProps, 'visible'>) => void;
  hideAlert: () => void;
  isVisible: boolean;
}

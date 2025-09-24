/**
 * Alert Service Layer Interfaces
 * 
 * This file contains alert and toast-related interfaces used in the service layer.
 */

import { Result } from './core';

// ============================================================================
// ALERT TYPES AND CONSTANTS
// ============================================================================

export enum AlertType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export const DEFAULT_TOAST_DURATION_MS = 3000;

// ============================================================================
// ALERT INTERFACES
// ============================================================================

export interface AlertDialog {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface AlertOptions {
  title?: string;
  message?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface IAlertService {
  showAlert(options: AlertOptions): Promise<Result<void>>;
  showConfirm(options: AlertOptions): Promise<Result<boolean>>;
  hideAlert(id: string): Promise<Result<void>>;
}

// ============================================================================
// TOAST INTERFACES
// ============================================================================

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: AlertType;
  duration?: number;
  timestamp: Date;
}

export interface IToastService {
  showToast(message: string, options?: Partial<ToastMessage>): Promise<Result<void>>;
  showSuccess(message: string, title?: string): Promise<Result<void>>;
  showError(message: string, title?: string): Promise<Result<void>>;
  showWarning(message: string, title?: string): Promise<Result<void>>;
  showInfo(message: string, title?: string): Promise<Result<void>>;
  hideToast(id: string): Promise<Result<void>>;
  clearAll(): Promise<Result<void>>;
}

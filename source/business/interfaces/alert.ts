/**
 * Alert Business Layer Interfaces and Types
 * All alert and toast-related interfaces, entities, and types
 */

import { Result } from './shared';

// ============================================================================
// ALERT CONSTANTS - Alert system constants
// ============================================================================

/**
 * The default duration in milliseconds that a toast message will be displayed.
 */
export const DEFAULT_TOAST_DURATION_MS = 3000;

/**
 * Alert and toast types
 */
export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Default text for alert buttons
 */
export const DEFAULT_CONFIRM_TEXT = 'OK';
export const DEFAULT_CANCEL_TEXT = 'Cancel';

// ============================================================================
// ALERT ENTITIES - Alert and toast domain objects
// ============================================================================

/**
 * Options for alert dialogs
 */
export interface AlertOptions {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

/**
 * Represents an alert dialog
 */
export class AlertDialog {
  private readonly _id: string;
  private readonly _title: string;
  private readonly _message: string;
  private readonly _type: AlertType;
  private readonly _confirmText: string;
  private readonly _cancelText: string;
  private readonly _onConfirm?: () => void;
  private readonly _onCancel?: () => void;
  private readonly _timestamp: number;

  /**
   * Creates a new AlertDialog instance
   */
  constructor(
    id: string,
    title: string,
    message: string,
    type: AlertType,
    options?: AlertOptions
  ) {
    this._id = id;
    this._title = title;
    this._message = message;
    this._type = type;
    this._confirmText = options?.confirmText || DEFAULT_CONFIRM_TEXT;
    this._cancelText = options?.cancelText || DEFAULT_CANCEL_TEXT;
    this._onConfirm = options?.onConfirm;
    this._onCancel = options?.onCancel;
    this._timestamp = Date.now();
  }

  // Getters
  public getId(): string { return this._id; }
  public getTitle(): string { return this._title; }
  public getMessage(): string { return this._message; }
  public getType(): AlertType { return this._type; }
  public getConfirmText(): string { return this._confirmText; }
  public getCancelText(): string { return this._cancelText; }
  public getOnConfirm(): (() => void) | undefined { return this._onConfirm; }
  public getOnCancel(): (() => void) | undefined { return this._onCancel; }
  public getTimestamp(): number { return this._timestamp; }

  // Factory methods
  public static createSuccess(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.SUCCESS, options);
  }

  public static createError(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.ERROR, options);
  }

  public static createWarning(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.WARNING, options);
  }

  public static createInfo(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.INFO, options);
  }
}

/**
 * Represents a toast notification message
 */
export class ToastMessage {
  private readonly _id: string;
  private readonly _message: string;
  private readonly _type: AlertType;
  private readonly _duration: number;
  private readonly _timestamp: number;

  /**
   * Creates a new ToastMessage instance
   */
  constructor(
    id: string,
    message: string,
    type: AlertType,
    duration: number = DEFAULT_TOAST_DURATION_MS
  ) {
    this._id = id;
    this._message = message;
    this._type = type;
    this._duration = duration;
    this._timestamp = Date.now();
  }

  // Getters
  public getId(): string { return this._id; }
  public getMessage(): string { return this._message; }
  public getType(): AlertType { return this._type; }
  public getDuration(): number { return this._duration; }
  public getTimestamp(): number { return this._timestamp; }

  // Factory methods
  public static createSuccess(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.SUCCESS, duration);
  }

  public static createError(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.ERROR, duration);
  }

  public static createWarning(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.WARNING, duration);
  }

  public static createInfo(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.INFO, duration);
  }
}

// ============================================================================
// ALERT SERVICE INTERFACES - Alert and toast service abstractions
// ============================================================================

/**
 * Interface for alert dialog service
 */
export interface IAlertService {
  /**
   * Show an alert dialog
   */
  showAlert(title: string, message: string, type: AlertType, options?: AlertOptions): Result<void>;
  
  /**
   * Hide the current alert dialog
   */
  hideAlert(): Result<void>;
  
  /**
   * Show a success alert dialog
   */
  showSuccessAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Show an error alert dialog
   */
  showErrorAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Show a warning alert dialog
   */
  showWarningAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Show an info alert dialog
   */
  showInfoAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Get the current alert dialog
   */
  getCurrentAlert(): AlertDialog | null;
  
  /**
   * Check if an alert is currently visible
   */
  isVisible(): boolean;
}

/**
 * Interface for toast notification service
 */
export interface IToastService {
  /**
   * Show a toast notification
   */
  showToast(message: string, type: AlertType, duration?: number): Result<void>;
  
  /**
   * Hide the current toast notification
   */
  hideToast(): Result<void>;
  
  /**
   * Show a success toast notification
   */
  showSuccess(message: string, duration?: number): Result<void>;
  
  /**
   * Show an error toast notification
   */
  showError(message: string, duration?: number): Result<void>;
  
  /**
   * Show a warning toast notification
   */
  showWarning(message: string, duration?: number): Result<void>;
  
  /**
   * Show an info toast notification
   */
  showInfo(message: string, duration?: number): Result<void>;
  
  /**
   * Get the current toast notification
   */
  getCurrentToast(): ToastMessage | null;
  
  /**
   * Check if a toast is currently visible
   */
  isVisible(): boolean;
}

// ============================================================================
// ALERT OPERATION RESULTS - Business operation results
// ============================================================================

/**
 * Alert operation result
 */
export interface AlertOperationResult {
  success: boolean;
  alertId?: string;
  error?: string;
}

/**
 * Toast operation result
 */
export interface ToastOperationResult {
  success: boolean;
  toastId?: string;
  error?: string;
}

// ============================================================================
// ALERT EVENTS - Alert system events
// ============================================================================

/**
 * Alert event types
 */
export enum AlertEvent {
  ALERT_SHOWN = 'alert_shown',
  ALERT_HIDDEN = 'alert_hidden',
  ALERT_CONFIRMED = 'alert_confirmed',
  ALERT_CANCELLED = 'alert_cancelled',
  TOAST_SHOWN = 'toast_shown',
  TOAST_HIDDEN = 'toast_hidden',
  TOAST_EXPIRED = 'toast_expired'
}

/**
 * Alert event data
 */
export interface AlertEventData {
  alertId?: string;
  toastId?: string;
  type: AlertType;
  message: string;
  timestamp: Date;
}

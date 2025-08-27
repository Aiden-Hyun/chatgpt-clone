/**
 * Alert system constants
 */

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
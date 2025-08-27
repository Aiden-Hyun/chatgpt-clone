import { AlertType, DEFAULT_CANCEL_TEXT, DEFAULT_CONFIRM_TEXT } from '../constants/alertConstants';

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
   * 
   * @param id Unique identifier for the alert
   * @param title The title of the alert
   * @param message The message to display
   * @param type The type of alert (success, error, warning, info)
   * @param options Additional options for the alert
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

  /**
   * Get the unique identifier
   */
  public getId(): string {
    return this._id;
  }

  /**
   * Get the title
   */
  public getTitle(): string {
    return this._title;
  }

  /**
   * Get the message
   */
  public getMessage(): string {
    return this._message;
  }

  /**
   * Get the alert type
   */
  public getType(): AlertType {
    return this._type;
  }

  /**
   * Get the confirm button text
   */
  public getConfirmText(): string {
    return this._confirmText;
  }

  /**
   * Get the cancel button text
   */
  public getCancelText(): string {
    return this._cancelText;
  }

  /**
   * Get the confirm action
   */
  public getOnConfirm(): (() => void) | undefined {
    return this._onConfirm;
  }

  /**
   * Get the cancel action
   */
  public getOnCancel(): (() => void) | undefined {
    return this._onCancel;
  }

  /**
   * Get the creation timestamp
   */
  public getTimestamp(): number {
    return this._timestamp;
  }

  /**
   * Factory method to create a success alert
   */
  public static createSuccess(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.SUCCESS, options);
  }

  /**
   * Factory method to create an error alert
   */
  public static createError(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.ERROR, options);
  }

  /**
   * Factory method to create a warning alert
   */
  public static createWarning(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.WARNING, options);
  }

  /**
   * Factory method to create an info alert
   */
  public static createInfo(id: string, title: string, message: string, options?: AlertOptions): AlertDialog {
    return new AlertDialog(id, title, message, AlertType.INFO, options);
  }
}

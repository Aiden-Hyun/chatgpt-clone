import { AlertType, DEFAULT_TOAST_DURATION_MS } from '../constants/alertConstants';

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
   * 
   * @param id Unique identifier for the toast
   * @param message The message to display
   * @param type The type of toast (success, error, warning, info)
   * @param duration How long the toast should be displayed in milliseconds
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

  /**
   * Get the unique identifier
   */
  public getId(): string {
    return this._id;
  }

  /**
   * Get the message text
   */
  public getMessage(): string {
    return this._message;
  }

  /**
   * Get the toast type
   */
  public getType(): AlertType {
    return this._type;
  }

  /**
   * Get the display duration in milliseconds
   */
  public getDuration(): number {
    return this._duration;
  }

  /**
   * Get the creation timestamp
   */
  public getTimestamp(): number {
    return this._timestamp;
  }

  /**
   * Factory method to create a success toast
   */
  public static createSuccess(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.SUCCESS, duration);
  }

  /**
   * Factory method to create an error toast
   */
  public static createError(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.ERROR, duration);
  }

  /**
   * Factory method to create a warning toast
   */
  public static createWarning(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.WARNING, duration);
  }

  /**
   * Factory method to create an info toast
   */
  public static createInfo(id: string, message: string, duration?: number): ToastMessage {
    return new ToastMessage(id, message, AlertType.INFO, duration);
  }
}

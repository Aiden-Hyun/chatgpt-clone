import { AlertType, DEFAULT_TOAST_DURATION_MS } from '../../business/alert/constants/alertConstants';
import { ToastMessage } from '../../business/alert/entities/ToastMessage';
import { IToastService } from '../../business/alert/interfaces/IToastService';
import { Result } from '../../business/shared/types/Result';
import { IIdGenerator } from '../chat/interfaces/IIdGenerator';
import { ILogger } from '../shared/interfaces/ILogger';

/**
 * Implementation of the IToastService interface
 */
export class ToastService implements IToastService {
  private currentToast: ToastMessage | null = null;
  private visible: boolean = false;
  private readonly logger: ILogger;
  private readonly idGenerator: IIdGenerator;
  
  /**
   * Creates a new ToastService
   * 
   * @param logger Logger for recording events
   * @param idGenerator Generator for creating unique IDs
   */
  constructor(logger: ILogger, idGenerator: IIdGenerator) {
    this.logger = logger;
    this.idGenerator = idGenerator;
  }
  
  /**
   * Show a toast notification
   * 
   * @param message The message to display
   * @param type The type of toast (success, error, warning, info)
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  public showToast(message: string, type: AlertType, duration: number = DEFAULT_TOAST_DURATION_MS): Result<void> {
    try {
      if (!message) {
        return { success: false, error: 'Toast message cannot be empty' };
      }
      
      const id = this.idGenerator.generate();
      this.currentToast = new ToastMessage(id, message, type, duration);
      this.visible = true;
      
      this.logger.info('Toast displayed', {
        id,
        type,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      });
      
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to show toast', { error, message, type });
      return { success: false, error: 'Failed to show toast' };
    }
  }
  
  /**
   * Hide the current toast notification
   * 
   * @returns A Result indicating success or failure
   */
  public hideToast(): Result<void> {
    try {
      if (this.currentToast) {
        this.logger.info('Toast hidden', { id: this.currentToast.getId() });
      }
      
      this.visible = false;
      
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to hide toast', { error });
      return { success: false, error: 'Failed to hide toast' };
    }
  }
  
  /**
   * Show a success toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  public showSuccess(message: string, duration?: number): Result<void> {
    return this.showToast(message, AlertType.SUCCESS, duration);
  }
  
  /**
   * Show an error toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  public showError(message: string, duration?: number): Result<void> {
    return this.showToast(message, AlertType.ERROR, duration);
  }
  
  /**
   * Show a warning toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  public showWarning(message: string, duration?: number): Result<void> {
    return this.showToast(message, AlertType.WARNING, duration);
  }
  
  /**
   * Show an info toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  public showInfo(message: string, duration?: number): Result<void> {
    return this.showToast(message, AlertType.INFO, duration);
  }
  
  /**
   * Get the current toast notification
   * 
   * @returns The current toast message or null if none is displayed
   */
  public getCurrentToast(): ToastMessage | null {
    return this.currentToast;
  }
  
  /**
   * Check if a toast is currently visible
   * 
   * @returns True if a toast is visible, false otherwise
   */
  public isVisible(): boolean {
    return this.visible;
  }
}
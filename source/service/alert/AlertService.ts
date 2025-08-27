import { AlertType } from '../../business/alert/constants/alertConstants';
import { AlertDialog, AlertOptions } from '../../business/alert/entities/AlertDialog';
import { IAlertService } from '../../business/alert/interfaces/IAlertService';
import { Result } from '../../business/shared/types/Result';
import { IIdGenerator } from '../chat/interfaces/IIdGenerator';
import { ILogger } from '../shared/interfaces/ILogger';

/**
 * Implementation of the IAlertService interface
 */
export class AlertService implements IAlertService {
  private currentAlert: AlertDialog | null = null;
  private visible: boolean = false;
  private readonly logger: ILogger;
  private readonly idGenerator: IIdGenerator;
  
  /**
   * Creates a new AlertService
   * 
   * @param logger Logger for recording events
   * @param idGenerator Generator for creating unique IDs
   */
  constructor(logger: ILogger, idGenerator: IIdGenerator) {
    this.logger = logger;
    this.idGenerator = idGenerator;
  }
  
  /**
   * Show an alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param type The type of alert (success, error, warning, info)
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  public showAlert(title: string, message: string, type: AlertType, options?: AlertOptions): Result<void> {
    try {
      if (!title || !message) {
        return { success: false, error: 'Alert title and message cannot be empty' };
      }
      
      const id = this.idGenerator.generate();
      this.currentAlert = new AlertDialog(id, title, message, type, options);
      this.visible = true;
      
      this.logger.info('Alert displayed', {
        id,
        type,
        title,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      });
      
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to show alert', { error, title, message, type });
      return { success: false, error: 'Failed to show alert' };
    }
  }
  
  /**
   * Hide the current alert dialog
   * 
   * @returns A Result indicating success or failure
   */
  public hideAlert(): Result<void> {
    try {
      if (this.currentAlert) {
        this.logger.info('Alert hidden', { id: this.currentAlert.getId() });
      }
      
      this.visible = false;
      
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to hide alert', { error });
      return { success: false, error: 'Failed to hide alert' };
    }
  }
  
  /**
   * Show a success alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  public showSuccessAlert(title: string, message: string, options?: AlertOptions): Result<void> {
    return this.showAlert(title, message, AlertType.SUCCESS, options);
  }
  
  /**
   * Show an error alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  public showErrorAlert(title: string, message: string, options?: AlertOptions): Result<void> {
    return this.showAlert(title, message, AlertType.ERROR, options);
  }
  
  /**
   * Show a warning alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  public showWarningAlert(title: string, message: string, options?: AlertOptions): Result<void> {
    return this.showAlert(title, message, AlertType.WARNING, options);
  }
  
  /**
   * Show an info alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  public showInfoAlert(title: string, message: string, options?: AlertOptions): Result<void> {
    return this.showAlert(title, message, AlertType.INFO, options);
  }
  
  /**
   * Get the current alert dialog
   * 
   * @returns The current alert dialog or null if none is displayed
   */
  public getCurrentAlert(): AlertDialog | null {
    return this.currentAlert;
  }
  
  /**
   * Check if an alert is currently visible
   * 
   * @returns True if an alert is visible, false otherwise
   */
  public isVisible(): boolean {
    return this.visible;
  }
}
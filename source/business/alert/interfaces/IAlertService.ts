import { Result } from '../../shared/types/Result';
import { AlertType } from '../constants/alertConstants';
import { AlertDialog, AlertOptions } from '../entities/AlertDialog';

/**
 * Interface for alert dialog service
 */
export interface IAlertService {
  /**
   * Show an alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param type The type of alert (success, error, warning, info)
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  showAlert(title: string, message: string, type: AlertType, options?: AlertOptions): Result<void>;
  
  /**
   * Hide the current alert dialog
   * 
   * @returns A Result indicating success or failure
   */
  hideAlert(): Result<void>;
  
  /**
   * Show a success alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  showSuccessAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Show an error alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  showErrorAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Show a warning alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  showWarningAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Show an info alert dialog
   * 
   * @param title The title of the alert
   * @param message The message to display
   * @param options Additional options for the alert
   * @returns A Result indicating success or failure
   */
  showInfoAlert(title: string, message: string, options?: AlertOptions): Result<void>;
  
  /**
   * Get the current alert dialog
   * 
   * @returns The current alert dialog or null if none is displayed
   */
  getCurrentAlert(): AlertDialog | null;
  
  /**
   * Check if an alert is currently visible
   * 
   * @returns True if an alert is visible, false otherwise
   */
  isVisible(): boolean;
}
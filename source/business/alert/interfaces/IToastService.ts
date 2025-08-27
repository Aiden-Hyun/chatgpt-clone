import { Result } from '../../shared/types/Result';
import { AlertType } from '../constants/alertConstants';
import { ToastMessage } from '../entities/ToastMessage';

/**
 * Interface for toast notification service
 */
export interface IToastService {
  /**
   * Show a toast notification
   * 
   * @param message The message to display
   * @param type The type of toast (success, error, warning, info)
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  showToast(message: string, type: AlertType, duration?: number): Result<void>;
  
  /**
   * Hide the current toast notification
   * 
   * @returns A Result indicating success or failure
   */
  hideToast(): Result<void>;
  
  /**
   * Show a success toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  showSuccess(message: string, duration?: number): Result<void>;
  
  /**
   * Show an error toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  showError(message: string, duration?: number): Result<void>;
  
  /**
   * Show a warning toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  showWarning(message: string, duration?: number): Result<void>;
  
  /**
   * Show an info toast notification
   * 
   * @param message The message to display
   * @param duration How long the toast should be displayed in milliseconds
   * @returns A Result indicating success or failure
   */
  showInfo(message: string, duration?: number): Result<void>;
  
  /**
   * Get the current toast notification
   * 
   * @returns The current toast message or null if none is displayed
   */
  getCurrentToast(): ToastMessage | null;
  
  /**
   * Check if a toast is currently visible
   * 
   * @returns True if a toast is visible, false otherwise
   */
  isVisible(): boolean;
}
import { Result } from '../../shared/types/Result';

/**
 * Interface for navigation tracker
 */
export interface INavigationTracker {
  /**
   * Set the previous route
   * 
   * @param route The route to set as previous
   * @returns A Result indicating success or failure
   */
  setPreviousRoute(route: string): Result<void>;
  
  /**
   * Get the previous route
   * 
   * @returns The previous route or null if none exists
   */
  getPreviousRoute(): string | null;
  
  /**
   * Clear the previous route
   * 
   * @returns A Result indicating success or failure
   */
  clearPreviousRoute(): Result<void>;
  
  /**
   * Add a route to the navigation history
   * 
   * @param route The route to add to history
   * @returns A Result indicating success or failure
   */
  addToHistory(route: string): Result<void>;
  
  /**
   * Get the navigation history
   * 
   * @returns The navigation history as an array of routes
   */
  getHistory(): string[];
  
  /**
   * Clear the navigation history
   * 
   * @returns A Result indicating success or failure
   */
  clearHistory(): Result<void>;
}

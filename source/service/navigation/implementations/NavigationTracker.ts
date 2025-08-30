import { ILogger, INavigationTracker } from '../../interfaces';

/**
 * Implementation of the INavigationTracker interface
 */
export class NavigationTracker implements INavigationTracker {
  private previousRoute: string | null = null;
  private history: string[] = [];
  private readonly logger: ILogger;
  
  /**
   * Creates a new NavigationTracker
   * 
   * @param logger The logger to use
   */
  constructor(logger: ILogger) {
    this.logger = logger;
  }
  
  /**
   * Set the previous route
   * 
   * @param route The route to set as previous
   * @returns A Result indicating success or failure
   */
  setPreviousRoute(route: string): Result<void> {
    try {
      this.previousRoute = route;
      this.logger.debug('Previous route set', { route });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to set previous route', { route, error });
      return { success: false, error: 'Failed to set previous route' };
    }
  }
  
  /**
   * Get the previous route
   * 
   * @returns The previous route or null if none exists
   */
  getPreviousRoute(): string | null {
    return this.previousRoute;
  }
  
  /**
   * Clear the previous route
   * 
   * @returns A Result indicating success or failure
   */
  clearPreviousRoute(): Result<void> {
    try {
      this.previousRoute = null;
      this.logger.debug('Previous route cleared');
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to clear previous route', { error });
      return { success: false, error: 'Failed to clear previous route' };
    }
  }
  
  /**
   * Add a route to the navigation history
   * 
   * @param route The route to add to history
   * @returns A Result indicating success or failure
   */
  addToHistory(route: string): Result<void> {
    try {
      // Don't add duplicates consecutively
      if (this.history.length === 0 || this.history[0] !== route) {
        this.history.unshift(route);
        // Keep history at a reasonable size
        if (this.history.length > 10) {
          this.history.pop();
        }
      }
      this.logger.debug('Route added to history', { route });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to add route to history', { route, error });
      return { success: false, error: 'Failed to add route to history' };
    }
  }
  
  /**
   * Get the navigation history
   * 
   * @returns The navigation history as an array of routes
   */
  getHistory(): string[] {
    return [...this.history];
  }
  
  /**
   * Clear the navigation history
   * 
   * @returns A Result indicating success or failure
   */
  clearHistory(): Result<void> {
    try {
      this.history = [];
      this.logger.debug('Navigation history cleared');
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to clear navigation history', { error });
      return { success: false, error: 'Failed to clear navigation history' };
    }
  }
}

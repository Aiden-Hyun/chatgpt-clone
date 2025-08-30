import { router } from 'expo-router';

import { ILogger, INavigationService, INavigationTracker } from '../../interfaces';

/**
 * Implementation of the INavigationService interface using Expo Router
 */
export class NavigationService implements INavigationService {
  private readonly navigationTracker: INavigationTracker;
  private readonly logger: ILogger;
  private currentRoute: string = '/';
  
  /**
   * Creates a new NavigationService
   * 
   * @param navigationTracker The navigation tracker to use
   * @param logger The logger to use
   */
  constructor(navigationTracker: INavigationTracker, logger: ILogger) {
    this.navigationTracker = navigationTracker;
    this.logger = logger;
  }
  
  /**
   * Navigate to a specific route
   * 
   * @param route The route to navigate to
   * @param params The route parameters
   * @returns A Result indicating success or failure
   */
  async navigate(route: string, params?: Record<string, unknown>): Promise<void> {
    try {
      const routePath = this.buildRoutePath(route, params);
      router.push(routePath);
      
      // Update current route
      this.currentRoute = routePath;
      
      // Update navigation tracker
      await this.navigationTracker.trackPageView(routePath, params);
      
      this.logger.info('Navigated to route', { route: routePath });
    } catch (error) {
      this.logger.error('Failed to navigate', { route, params, error });
      throw new Error('Failed to navigate');
    }
  }
  
  /**
   * Go back to the previous route
   * 
   * @returns A Promise that resolves when navigation is complete
   */
  async goBack(): Promise<void> {
    try {
      router.back();
      this.logger.info('Navigated back');
    } catch (error) {
      this.logger.error('Failed to navigate back', { error });
      throw new Error('Failed to navigate back');
    }
  }
  
  /**
   * Check if navigation can go back
   * 
   * @returns A Promise that resolves to true if navigation can go back
   */
  async canGoBack(): Promise<boolean> {
    // This is a simplified implementation
    // In a real app, you might check router.canGoBack() or similar
    return true;
  }
  
  /**
   * Get the current route
   * 
   * @returns A Promise that resolves to the current route
   */
  async getCurrentRoute(): Promise<string> {
    return this.currentRoute;
  }
  
  /**
   * Build a route path with parameters
   * 
   * @param route The base route
   * @param params The route parameters
   * @returns The complete route path
   */
  private buildRoutePath(route: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return route;
    }
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `${route}?${queryString}` : route;
  }
  
  /**
   * Reset the navigation history
   * 
   * @param route The route to reset to
   * @param params The route parameters
   * @returns A Result indicating success or failure
   */
  reset<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void> {
    try {
      const routePath = buildRoute(route, params);
      router.replace(routePath);
      
      // Reset navigation state
      this.navigationState = new NavigationState(routePath);
      
      // Clear navigation tracker
      this.navigationTracker.clearPreviousRoute();
      this.navigationTracker.clearHistory();
      
      this.logger.info('Reset navigation to route', { route: routePath });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to reset navigation', { route, params, error });
      return { success: false, error: 'Failed to reset navigation' };
    }
  }
  
  /**
   * Get the current navigation state
   * 
   * @returns The current navigation state
   */
  getNavigationState(): NavigationState {
    return this.navigationState;
  }
  
  /**
   * Navigate to a specific chat room
   * 
   * @param roomId The room ID to navigate to
   * @returns A Result indicating success or failure
   */
  navigateToRoom(roomId: string): Result<void> {
    return this.navigate(AppRoute.CHAT_ROOM, { roomId });
  }
  
  /**
   * Navigate to home/rooms list
   * 
   * @returns A Result indicating success or failure
   */
  navigateToHome(): Result<void> {
    return this.navigate(AppRoute.HOME);
  }
  
  /**
   * Navigate to a new chat
   * 
   * @returns A Result indicating success or failure
   */
  navigateToNewChat(): Result<void> {
    return this.navigate(AppRoute.CHAT);
  }
}


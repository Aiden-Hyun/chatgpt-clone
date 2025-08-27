import { router } from 'expo-router';
import { AppRoute, ParamsOf, buildRoute } from '../../../business/navigation/constants/routes';
import { NavigationState } from '../../../business/navigation/entities/NavigationState';
import { INavigationService } from '../../../business/navigation/interfaces/INavigationService';
import { INavigationTracker } from '../../../business/navigation/interfaces/INavigationTracker';
import { Result } from '../../../business/shared/types/Result';
import { ILogger } from '../../shared/interfaces/ILogger';

/**
 * Implementation of the INavigationService interface using Expo Router
 */
export class NavigationService implements INavigationService {
  private navigationState: NavigationState;
  private readonly navigationTracker: INavigationTracker;
  private readonly logger: ILogger;
  
  /**
   * Creates a new NavigationService
   * 
   * @param navigationTracker The navigation tracker to use
   * @param logger The logger to use
   */
  constructor(navigationTracker: INavigationTracker, logger: ILogger) {
    this.navigationTracker = navigationTracker;
    this.logger = logger;
    this.navigationState = NavigationState.createInitial();
  }
  
  /**
   * Navigate to a specific route
   * 
   * @param route The route to navigate to
   * @param params The route parameters
   * @returns A Result indicating success or failure
   */
  navigate<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void> {
    try {
      const routePath = buildRoute(route, params);
      router.push(routePath);
      
      // Update navigation state
      this.navigationState = this.navigationState.pushRoute(routePath);
      
      // Update navigation tracker
      this.navigationTracker.setPreviousRoute(this.navigationState.getCurrentRoute());
      this.navigationTracker.addToHistory(routePath);
      
      this.logger.info('Navigated to route', { route: routePath });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to navigate', { route, params, error });
      return { success: false, error: 'Failed to navigate' };
    }
  }
  
  /**
   * Replace the current route with a new route
   * 
   * @param route The route to replace with
   * @param params The route parameters
   * @returns A Result indicating success or failure
   */
  replace<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void> {
    try {
      const routePath = buildRoute(route, params);
      router.replace(routePath);
      
      // Update navigation state
      this.navigationState = this.navigationState.replaceRoute(routePath);
      
      this.logger.info('Replaced route', { route: routePath });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to replace route', { route, params, error });
      return { success: false, error: 'Failed to replace route' };
    }
  }
  
  /**
   * Go back to the previous route
   * 
   * @returns A Result indicating success or failure
   */
  goBack(): Result<void> {
    try {
      router.back();
      
      // Update navigation state
      this.navigationState = this.navigationState.goBack();
      
      this.logger.info('Navigated back');
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('Failed to navigate back', { error });
      return { success: false, error: 'Failed to navigate back' };
    }
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

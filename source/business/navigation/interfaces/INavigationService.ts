import { Result } from '../../shared/types/Result';
import { AppRoute, ParamsOf } from '../constants/routes';
import { NavigationState } from '../entities/NavigationState';

/**
 * Interface for navigation service
 */
export interface INavigationService {
  /**
   * Navigate to a specific route
   * 
   * @param route The route to navigate to
   * @param params The route parameters
   * @returns A Result indicating success or failure
   */
  navigate<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void>;
  
  /**
   * Replace the current route with a new route
   * 
   * @param route The route to replace with
   * @param params The route parameters
   * @returns A Result indicating success or failure
   */
  replace<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void>;
  
  /**
   * Go back to the previous route
   * 
   * @returns A Result indicating success or failure
   */
  goBack(): Result<void>;
  
  /**
   * Reset the navigation history
   * 
   * @param route The route to reset to
   * @param params The route parameters
   * @returns A Result indicating success or failure
   */
  reset<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void>;
  
  /**
   * Get the current navigation state
   * 
   * @returns The current navigation state
   */
  getNavigationState(): NavigationState;
  
  /**
   * Navigate to a specific chat room
   * 
   * @param roomId The room ID to navigate to
   * @returns A Result indicating success or failure
   */
  navigateToRoom(roomId: string): Result<void>;
  
  /**
   * Navigate to home/rooms list
   * 
   * @returns A Result indicating success or failure
   */
  navigateToHome(): Result<void>;
  
  /**
   * Navigate to a new chat
   * 
   * @returns A Result indicating success or failure
   */
  navigateToNewChat(): Result<void>;
}
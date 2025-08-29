import { NavigationState } from '../../../business/navigation/entities/NavigationState';
import { Result } from '../../../business/types/shared/Result';

/**
 * Interface for adapting navigation state to platform-specific implementations
 */
export interface INavigationStateAdapter {
  /**
   * Save the navigation state
   * 
   * @param state The navigation state to save
   * @returns A Result indicating success or failure
   */
  saveState(state: NavigationState): Promise<Result<void>>;
  
  /**
   * Get the navigation state
   * 
   * @returns A Result containing the navigation state or an error
   */
  getState(): Promise<Result<NavigationState>>;
  
  /**
   * Sync the navigation state with the platform
   * 
   * @param state The navigation state to sync
   * @returns A Result indicating success or failure
   */
  syncState(state: NavigationState): Result<void>;
  
  /**
   * Listen for navigation state changes from the platform
   * 
   * @param callback The callback to call when the state changes
   * @returns A function to unsubscribe from the listener
   */
  listenForStateChanges(callback: (state: NavigationState) => void): () => void;
}

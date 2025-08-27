import { ILogger } from '../../shared/interfaces/ILogger';
import { NavigationTracker } from '../implementations/NavigationTracker';

/**
 * Create a navigation tracker with the given logger
 * 
 * @param logger The logger to use
 * @returns A new NavigationTracker instance
 */
export function createNavigationTracker(logger: ILogger): NavigationTracker {
  return new NavigationTracker(logger);
}
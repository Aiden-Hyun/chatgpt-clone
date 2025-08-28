// source/service/navigation/utils/navigationTrackerInstance.ts
import { Logger } from '../../shared/utils/Logger';
import { NavigationTracker } from '../implementations/NavigationTracker';

// Create a logger instance for navigation
const logger = new Logger().child('Navigation');

// Create a singleton instance of NavigationTracker for global use
// This mimics the behavior of the original navigationTracker from src
export const navigationTracker = new NavigationTracker(logger);

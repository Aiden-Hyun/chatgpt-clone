/**
 * Navigation Presentation Interfaces
 * 
 * All navigation-related interfaces for the presentation layer.
 */

import { ReactNode } from 'react';

import { AppRoute, NavigationState, ParamsOf } from '../../business/interfaces/navigation';

// ============================================================================
// NAVIGATION CONTEXT INTERFACES
// ============================================================================

/**
 * Navigation context type
 */
export interface NavigationContextType {
  // Navigation state
  navigationState: NavigationState;
  
  // Navigation methods
  navigate: <T extends AppRoute>(route: T, params?: ParamsOf<T>) => void;
  replace: <T extends AppRoute>(route: T, params?: ParamsOf<T>) => void;
  goBack: () => void;
  reset: <T extends AppRoute>(route: T, params?: ParamsOf<T>) => void;
  
  // Convenience navigation methods
  navigateToRoom: (roomId: string) => void;
  navigateToHome: () => void;
  navigateToNewChat: () => void;
  
  // Navigation state helpers
  isCurrentRoute: (route: AppRoute | string) => boolean;
  getPreviousRoute: () => string | null;
  getHistory: () => readonly string[];
}

/**
 * Navigation provider props
 */
export interface NavigationProviderProps {
  children: ReactNode;
}

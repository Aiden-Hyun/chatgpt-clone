/**
 * Navigation Business Layer Interfaces and Types
 * All navigation-related interfaces and types
 */

import { Result } from './shared';

// ============================================================================
// NAVIGATION TYPES - Route and navigation types
// ============================================================================

/**
 * Application routes enumeration
 */
export enum AppRoute {
  // Auth routes
  AUTH = '/auth',
  SIGN_IN = '/auth/sign-in',
  SIGN_UP = '/auth/sign-up',
  RESET_PASSWORD = '/auth/reset-password',
  
  // Main app routes
  HOME = '/',
  CHAT = '/chat',
  CHAT_ROOM = '/chat/[roomId]',
  SETTINGS = '/settings',
  SETTINGS_ACCOUNT = '/settings/account',
  SETTINGS_THEMES = '/settings/themes',
  DESIGN_SHOWCASE = '/design-showcase',
  
  // Error routes
  NOT_FOUND = '/not-found',
}

/**
 * Route parameters type mapping
 */
export type ParamsOf<T extends AppRoute> = T extends AppRoute.CHAT_ROOM
  ? { roomId: string }
  : T extends AppRoute.CHAT
  ? { roomId?: string }
  : Record<string, never>;

/**
 * Navigation state interface
 */
export interface NavigationState {
  currentRoute: string;
  previousRoute?: string;
  params?: Record<string, any>;
  history: string[];
  canGoBack: boolean;
}

// ============================================================================
// NAVIGATION ENTITIES - Navigation domain objects
// ============================================================================

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  route: string;
  params?: Record<string, any>;
  timestamp: Date;
}

/**
 * Navigation context
 */
export interface NavigationContext {
  currentRoute: string;
  previousRoute?: string;
  routeStack: NavigationHistoryEntry[];
  metadata?: Record<string, any>;
}

/**
 * Maximum number of routes to keep in history
 */
const MAX_HISTORY_LENGTH = 10;

/**
 * NavigationState class representing the navigation state of the application
 */
export class NavigationState {
  private readonly _currentRoute: string;
  private readonly _previousRoute: string | null;
  private readonly _history: string[];
  
  /**
   * Creates a new NavigationState instance
   */
  constructor(
    currentRoute: string,
    previousRoute: string | null = null,
    history: string[] = []
  ) {
    this._currentRoute = currentRoute;
    this._previousRoute = previousRoute;
    this._history = [...history];
  }
  
  /**
   * Get the current route
   */
  public getCurrentRoute(): string {
    return this._currentRoute;
  }
  
  /**
   * Get the previous route
   */
  public getPreviousRoute(): string | null {
    return this._previousRoute;
  }
  
  /**
   * Get the navigation history
   */
  public getHistory(): readonly string[] {
    return [...this._history];
  }
  
  /**
   * Check if the current route matches the given route
   */
  public isCurrentRoute(route: AppRoute | string): boolean {
    return this._currentRoute === route;
  }
  
  /**
   * Create a new state with the given route pushed to the history
   */
  public pushRoute(route: string): NavigationState {
    const newHistory = [this._currentRoute, ...this._history]
      .slice(0, MAX_HISTORY_LENGTH);
    
    return new NavigationState(
      route,
      this._currentRoute,
      newHistory
    );
  }
  
  /**
   * Create a new state with the current route replaced by the given route
   */
  public replaceRoute(route: string): NavigationState {
    return new NavigationState(
      route,
      this._previousRoute,
      this._history
    );
  }
  
  /**
   * Create a new state by going back to the previous route
   */
  public goBack(): NavigationState {
    if (!this._previousRoute) {
      return this;
    }
    
    const newHistory = this._history.length > 0
      ? this._history.slice(1)
      : [];
    
    const newPreviousRoute = newHistory.length > 0
      ? newHistory[0]
      : null;
    
    return new NavigationState(
      this._previousRoute,
      newPreviousRoute,
      newHistory
    );
  }
  
  /**
   * Create a new state by resetting the history
   */
  public resetHistory(): NavigationState {
    return new NavigationState(
      this._currentRoute,
      null,
      []
    );
  }
  
  /**
   * Create a new NavigationState with the home route
   */
  public static createInitial(): NavigationState {
    return new NavigationState(AppRoute.HOME);
  }
}

// ============================================================================
// NAVIGATION SERVICE INTERFACES - Navigation abstractions
// ============================================================================

/**
 * Interface for navigation service
 */
export interface INavigationService {
  /**
   * Navigate to a specific route
   */
  navigate<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void>;
  
  /**
   * Replace the current route with a new route
   */
  replace<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void>;
  
  /**
   * Go back to the previous route
   */
  goBack(): Result<void>;
  
  /**
   * Reset the navigation history
   */
  reset<T extends AppRoute>(route: T, params?: ParamsOf<T>): Result<void>;
  
  /**
   * Get the current navigation state
   */
  getNavigationState(): NavigationState;
  
  /**
   * Navigate to a specific chat room
   */
  navigateToRoom(roomId: string): Result<void>;
  
  /**
   * Navigate to home/rooms list
   */
  navigateToHome(): Result<void>;
  
  /**
   * Navigate to a new chat
   */
  navigateToNewChat(): Result<void>;
}

/**
 * Interface for navigation tracker
 */
export interface INavigationTracker {
  /**
   * Set the previous route
   */
  setPreviousRoute(route: string): Result<void>;
  
  /**
   * Get the previous route
   */
  getPreviousRoute(): string | null;
  
  /**
   * Clear the previous route
   */
  clearPreviousRoute(): Result<void>;
  
  /**
   * Add a route to the navigation history
   */
  addToHistory(route: string): Result<void>;
  
  /**
   * Get the navigation history
   */
  getHistory(): string[];
  
  /**
   * Clear the navigation history
   */
  clearHistory(): Result<void>;
}

// ============================================================================
// NAVIGATION OPERATION RESULTS - Business operation results
// ============================================================================

/**
 * Navigation operation result
 */
export interface NavigationResult {
  success: boolean;
  route?: string;
  error?: string;
}

/**
 * Route validation result
 */
export interface RouteValidationResult {
  isValid: boolean;
  route?: AppRoute;
  error?: string;
}

// ============================================================================
// NAVIGATION EVENTS - Navigation system events
// ============================================================================

/**
 * Navigation event types
 */
export enum NavigationEvent {
  ROUTE_CHANGED = 'navigation_route_changed',
  NAVIGATION_STARTED = 'navigation_started',
  NAVIGATION_COMPLETED = 'navigation_completed',
  NAVIGATION_FAILED = 'navigation_failed',
  BACK_NAVIGATION = 'navigation_back',
  ROUTE_RESET = 'navigation_reset'
}

/**
 * Navigation event data
 */
export interface NavigationEventData {
  fromRoute?: string;
  toRoute: string;
  params?: Record<string, any>;
  timestamp: Date;
  navigationMethod: 'navigate' | 'replace' | 'goBack' | 'reset';
}

// ============================================================================
// NAVIGATION HELPERS - Utility functions and constants
// ============================================================================

/**
 * Route validation helper
 */
export function isValidRoute(route: string): route is AppRoute {
  return Object.values(AppRoute).includes(route as AppRoute);
}

/**
 * Get route display name
 */
export function getRouteDisplayName(route: AppRoute): string {
  const displayNames: Record<AppRoute, string> = {
    [AppRoute.HOME]: 'Home',
    [AppRoute.CHAT]: 'Chat',
    [AppRoute.CHAT_ROOM]: 'Chat Room',
    [AppRoute.AUTH]: 'Authentication',
    [AppRoute.SETTINGS]: 'Settings',
    [AppRoute.PROFILE]: 'Profile',
    [AppRoute.NOT_FOUND]: 'Not Found'
  };
  
  return displayNames[route] || route;
}

/**
 * Check if route requires authentication
 */
export function requiresAuth(route: AppRoute): boolean {
  const publicRoutes = [AppRoute.AUTH, AppRoute.NOT_FOUND];
  return !publicRoutes.includes(route);
}

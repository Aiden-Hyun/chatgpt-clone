import { AppRoute } from '../constants/routes';

/**
 * Maximum number of routes to keep in history
 */
const MAX_HISTORY_LENGTH = 10;

/**
 * Represents the navigation state of the application
 */
export class NavigationState {
  private readonly _currentRoute: string;
  private readonly _previousRoute: string | null;
  private readonly _history: string[];
  
  /**
   * Creates a new NavigationState instance
   * 
   * @param currentRoute The current route
   * @param previousRoute The previous route
   * @param history The navigation history
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

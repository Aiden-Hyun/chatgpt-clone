/**
 * Domain Service Layer Interfaces
 * 
 * This file contains domain-specific interfaces used in the service layer.
 */

// ============================================================================
// THEME INTERFACES
// ============================================================================

export interface IThemeService {
  getCurrentTheme(): Promise<string>;
  setTheme(themeName: string): Promise<void>;
  getAvailableThemes(): Promise<string[]>;
  initializeThemes(): Promise<void>;
}

// ============================================================================
// CLIPBOARD INTERFACES
// ============================================================================

export interface IClipboardService {
  copyToClipboard(text: string): Promise<boolean>;
  getFromClipboard(): Promise<string>;
  hasString(): Promise<boolean>;
}

// ============================================================================
// NAVIGATION INTERFACES
// ============================================================================

export interface INavigationService {
  navigate(route: string, params?: Record<string, unknown>): Promise<void>;
  goBack(): Promise<void>;
  canGoBack(): Promise<boolean>;
  getCurrentRoute(): Promise<string>;
}

export interface INavigationTracker {
  trackPageView(route: string, params?: Record<string, unknown>): Promise<void>;
  trackEvent(eventName: string, properties?: Record<string, unknown>): Promise<void>;
}

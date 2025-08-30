/**
 * Shared Presentation Interfaces
 * 
 * Common interfaces used across multiple presentation domains.
 */

import * as React from 'react';

// ============================================================================
// LOGGER INTERFACE - From service layer
// ============================================================================

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  error?: Error;
}

/**
 * Logger interface for the presentation layer
 * Based on service layer ILogger
 */
export interface ILogger {
  /**
   * Log a debug message
   */
  debug(message: string, context?: string, data?: any): void;

  /**
   * Log an info message
   */
  info(message: string, context?: string, data?: any): void;

  /**
   * Log a warning message
   */
  warn(message: string, context?: string, data?: any): void;

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: string, data?: any): void;

  /**
   * Create a child logger with additional context
   */
  child(context: string): ILogger;
}

// ============================================================================
// SERVICE INTERFACES - From business layer
// ============================================================================

/**
 * Alert service interface
 */
export interface IAlertService {
  showAlert(message: string, type?: 'success' | 'error' | 'warning' | 'info'): void;
  hideAlert(): void;
  isVisible: boolean;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  defaultDuration: number;
  position: 'top' | 'bottom' | 'center';
  maxAlerts: number;
}

/**
 * Clipboard adapter interface
 */
export interface IClipboardAdapter {
  copyToClipboard(text: string): Promise<{ success: boolean; error?: string }>;
  getFromClipboard(): Promise<{ success: boolean; text?: string; error?: string }>;
  hasString(): Promise<boolean>;
}

/**
 * Clipboard data interface
 */
export interface ClipboardData {
  text?: string;
  hasContent: boolean;
}

/**
 * Language service interface
 */
export interface ILanguageService {
  getCurrentLanguage(): string;
  setLanguage(language: string): Promise<void>;
  getAvailableLanguages(): string[];
  translate(key: string, params?: Record<string, string>): string;
}

/**
 * Language configuration
 */
export interface LanguageConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
}

/**
 * Navigation service interface
 */
export interface INavigationService {
  navigate(route: string, params?: Record<string, any>): void;
  goBack(): void;
  canGoBack(): boolean;
  getCurrentRoute(): string;
  getCurrentParams(): Record<string, any>;
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  initialRoute: string;
  enableDeepLinking: boolean;
  enableAnalytics: boolean;
}

/**
 * Storage service interface
 */
export interface IStorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  prefix: string;
  encryption: boolean;
  maxSize: number;
}

// ============================================================================
// BUSINESS INTERFACE IMPORTS - Re-exports for import resolution
// ============================================================================

/**
 * Business alert interfaces
 * This is referenced in the import error for 'business/alert/interfaces'
 */
export interface BusinessAlertInterfaces {
  // Re-export from business layer
  IAlertService: any;
  AlertConfig: any;
}

/**
 * Business chat interfaces
 * This is referenced in the import error for 'business/chat/interfaces/IClipboardAdapter'
 */
export interface BusinessChatInterfaces {
  // Re-export from business layer
  IClipboardAdapter: any;
  ClipboardData: any;
}

/**
 * Business language interfaces
 * This is referenced in the import error for 'business/language/interfaces/ILanguageService'
 */
export interface BusinessLanguageInterfaces {
  // Re-export from business layer
  ILanguageService: any;
  LanguageConfig: any;
}

/**
 * Business navigation interfaces
 * This is referenced in the import error for 'business/navigation/interfaces'
 */
export interface BusinessNavigationInterfaces {
  // Re-export from business layer
  INavigationService: any;
  NavigationConfig: any;
}

/**
 * Business storage interfaces
 * This is referenced in the import error for 'business/storage/interfaces'
 */
export interface BusinessStorageInterfaces {
  // Re-export from business layer
  IStorageService: any;
  StorageConfig: any;
}

/**
 * Service shared interfaces
 * This is referenced in the import error for 'service/shared/interfaces/ILogger'
 */
export interface ServiceSharedInterfaces {
  // Re-export from service layer
  ILogger: any;
  LogLevel: any;
  LogEntry: any;
}

// ============================================================================
// BASE COMPONENT INTERFACES
// ============================================================================

/**
 * Base props for all presentation components
 */
export interface BaseComponentProps {
  children?: React.ReactNode;
  testID?: string;
  style?: any;
  className?: string;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

/**
 * Error state interface
 */
export interface ErrorState {
  hasError: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Combined component state
 */
export interface ComponentState extends LoadingState, ErrorState {
  isVisible: boolean;
  isDisabled: boolean;
}

// ============================================================================
// EVENT HANDLER INTERFACES
// ============================================================================

export type EventHandler<T = void> = () => T;
export type EventHandlerWithParam<P, T = void> = (param: P) => T;
export type AsyncEventHandler<T = void> = () => Promise<T>;
export type AsyncEventHandlerWithParam<P, T = void> = (param: P) => Promise<T>;

// ============================================================================
// FORM INTERFACES
// ============================================================================

/**
 * Form field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

/**
 * Form field state
 */
export interface FieldState<T = any> {
  value: T;
  error?: string;
  warning?: string;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
}

/**
 * Form state
 */
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string>;
  warnings: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ============================================================================
// UI UTILITY INTERFACES
// ============================================================================

/**
 * Component size variants
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * Component variant types
 */
export type ComponentVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'info';

/**
 * Component alignment types
 */
export type ComponentAlignment = 'left' | 'center' | 'right';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

/**
 * Responsive breakpoint types
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Responsive value type
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// ============================================================================
// NAVIGATION INTERFACES
// ============================================================================

/**
 * Navigation options
 */
export interface NavigationOptions {
  replace?: boolean;
  params?: Record<string, string>;
  state?: any;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  protected?: boolean;
}

// ============================================================================
// NAVIGATION COMPONENT INTERFACES
// ============================================================================

/**
 * Haptic tab interface
 */
export interface HapticTabProps {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  disabled?: boolean;
}

/**
 * Tab bar background interface
 */
export interface TabBarBackgroundProps {
  color: string;
  opacity: number;
  blur?: boolean;
}

/**
 * Tab bar background iOS interface
 */
export interface TabBarBackgroundIOSProps {
  color: string;
  opacity: number;
  blur?: boolean;
  material?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick';
}

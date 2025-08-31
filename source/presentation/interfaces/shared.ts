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
 * Clipboard adapter interface
 */
export interface IClipboardAdapter {
  copyToClipboard(text: string): Promise<{ success: boolean; error?: string }>;
  getFromClipboard(): Promise<{ success: boolean; text?: string; error?: string }>;
  hasString(): Promise<boolean>;
}

// ============================================================================
// BUSINESS CONTEXT INTERFACES
// ============================================================================

/**
 * Business context value
 */
export interface BusinessContextValue {
  useCaseFactory: any; // UseCaseFactory
  businessProvider: any; // BusinessLayerProvider
  clipboard: IClipboardAdapter;
  languageService: ILanguageService;
  toastService: any; // IToastService
  alertService: IAlertService;
  navigationService: INavigationService;
  navigationTracker: any; // INavigationTracker
  storageService: IStorageService;
  secureStorageService: any; // ISecureStorageService
  getAccessToken: () => Promise<string | null>;
}

/**
 * Business context provider props
 */
export interface BusinessContextProviderProps {
  children: React.ReactNode;
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
 * Storage service interface
 */
export interface IStorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
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

// ============================================================================
// FORM INTERFACES
// ============================================================================

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

// ============================================================================
// UI UTILITY INTERFACES
// ============================================================================

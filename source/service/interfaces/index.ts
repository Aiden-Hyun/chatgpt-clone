/**
 * Service Layer Interfaces - Main Export File
 * 
 * This file exports all service layer interfaces, types, and entities
 * from a centralized location for easy importing throughout the service layer.
 * 
 * Usage:
 * import { Result, ILogger, IStorageService } from '@service/interfaces';
 */

// ============================================================================
// SERVICE-SPECIFIC INTERFACES
// ============================================================================

// Auth utilities
export * from './auth-utils';

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

// Logger interface
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

// Validation Result interface
export interface IValidationResult {
  isValid: boolean;
  error?: string;
}

// Message Validator interface
export interface IMessageValidator {
  validateContent(content: string): IValidationResult;
  validateMessageId(messageId: string): IValidationResult;
  validateRoomId(roomId: string): IValidationResult;
}

// Storage enums
export enum WebStorageType {
  LOCAL = 'local',
  SESSION = 'session',
}

// ============================================================================
// ENUM EXPORTS - Commonly used enums
// ============================================================================
export {
    AlertType,
    AppRoute,
    AuthEvent, LanguageEvent, MessageRole, NavigationEvent, SessionEvent, SessionStatus, SessionValidationError
} from './shared';

export {
    FeatureAccess, Permission
} from './auth';

export {
    AppStorageKeys, AuthStorageKeys, ChatStorageKeys, PreferencesStorageKeys
} from './storage';

// ============================================================================
// CONSTANT EXPORTS - Useful constants
// ============================================================================
export {
    DEFAULT_CANCEL_TEXT, DEFAULT_CONFIRM_TEXT, DEFAULT_LANGUAGE, DEFAULT_TOAST_DURATION_MS, SESSION_EXPIRY_THRESHOLDS, SUPPORTED_LANGUAGES
} from './shared';

export {
    AVAILABLE_MODELS,
    DEFAULT_MODEL
} from './chat';

// ============================================================================
// HELPER FUNCTION EXPORTS - Utility functions
// ============================================================================
export {
    createFailure, createSessionFailure, createSessionSuccess, createSuccess, isFailure, isSuccess, isValidSessionStatus,
    isValidSessionValidationError
} from './shared';

export {
    getModelInfo,
    validateModelCapabilities
} from './chat';

export {
    getRouteDisplayName, isValidRoute, requiresAuth
} from './navigation';

export {
    formatPlural, getBrowserLanguage, getLanguageByCode,
    isLanguageSupported
} from './language';

export {
    createUserSession, getSessionRemainingTime, sessionNeedsRefresh
} from './session';


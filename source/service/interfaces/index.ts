/**
 * Business Layer Interfaces - Main Export File
 * 
 * This file exports all business layer interfaces, types, and entities
 * from a centralized location for easy importing throughout the application.
 * 
 * Usage:
 * import { Result, IUserSession, User, ChatRoomEntity } from '@business/interfaces';
 */

// ============================================================================
// SHARED INTERFACES - Core business types
// ============================================================================
export * from './shared';

// ============================================================================
// AUTHENTICATION INTERFACES - Auth domain
// ============================================================================
export * from './auth';

// ============================================================================
// CHAT INTERFACES - Chat domain
// ============================================================================
export * from './chat';

// ============================================================================
// STORAGE INTERFACES - Storage domain
// ============================================================================
export * from './storage';

// ============================================================================
// ALERT INTERFACES - Alert and toast domain
// ============================================================================
export * from './alert';

// ============================================================================
// NAVIGATION INTERFACES - Navigation domain
// ============================================================================
export * from './navigation';

// ============================================================================
// LANGUAGE INTERFACES - Language and i18n domain
// ============================================================================
export * from './language';

// ============================================================================
// SESSION INTERFACES - Session management domain
// ============================================================================
export * from './session';

// ============================================================================
// THEME INTERFACES - Theme and styling domain
// ============================================================================
export * from './theme';

// ============================================================================
// THEME TOKENS - Design tokens and styling constants
// ============================================================================
export * from './tokens';

// ============================================================================
// USE CASE INTERFACES - Use case parameters and results
// ============================================================================
export * from './use-cases';

// ============================================================================
// VIEW MODEL INTERFACES - View model states and actions
// ============================================================================
export * from './view-models';

// ============================================================================
// TYPE EXPORTS - Commonly used type aliases
// ============================================================================

// Result pattern types
export type {
    AsyncResult, Failure, Result,
    Success
} from './shared';

// Entity types
export type {
    AlertDialog, ChatRoomEntity, MessageEntity, ToastMessage, User, UserSession
} from './auth';

export type {
    ChatRoomEntity as ChatRoom, MessageEntity as Message
} from './chat';

// Service interface types
export type {
    IAuthEventEmitter, IUserRepository
} from './auth';

export type {
    IAIProvider, IChatRoomRepository, IClipboardAdapter, IIdGenerator, IMessageRepository
} from './chat';

export type {
    ISecureStorageService, IStorageService
} from './storage';

export type {
    IAlertService, IToastService
} from './alert';

export type {
    INavigationService, INavigationTracker
} from './navigation';

export type {
    ILanguageRepository, ILanguageService
} from './language';

export type {
    ISessionRepository
} from './session';

// ============================================================================
// ADDITIONAL SERVICE INTERFACES
// ============================================================================

// Logger interface
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
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


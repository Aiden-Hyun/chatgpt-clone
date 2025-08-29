/**
 * Storage Business Layer Interfaces and Types
 * All storage-related interfaces and types
 */

import { Result } from './shared';

// ============================================================================
// STORAGE KEY TYPES - Storage key definitions
// ============================================================================

/**
 * Authentication related storage keys
 */
export enum AuthStorageKeys {
  /**
   * User authentication token
   */
  AUTH_TOKEN = 'auth_token',
  
  /**
   * User refresh token
   */
  REFRESH_TOKEN = 'refresh_token',
  
  /**
   * User ID
   */
  USER_ID = 'user_id',
  
  /**
   * User email
   */
  USER_EMAIL = 'user_email',
  
  /**
   * Remember me flag
   */
  REMEMBER_ME = 'remember_me',
  
  /**
   * Last login timestamp
   */
  LAST_LOGIN = 'last_login',
}

/**
 * User preferences storage keys
 */
export enum PreferencesStorageKeys {
  /**
   * Selected theme
   */
  THEME = 'theme',
  
  /**
   * Selected language
   */
  LANGUAGE = 'language',
  
  /**
   * Dark mode preference
   */
  DARK_MODE = 'dark_mode',
  
  /**
   * Notification settings
   */
  NOTIFICATIONS = 'notifications',
}

/**
 * Chat related storage keys
 */
export enum ChatStorageKeys {
  /**
   * Draft messages
   */
  DRAFT_MESSAGES = 'draft_messages',
  
  /**
   * Selected model
   */
  SELECTED_MODEL = 'selected_model',
  
  /**
   * Recent conversations
   */
  RECENT_CONVERSATIONS = 'recent_conversations',
}

/**
 * Application settings storage keys
 */
export enum AppStorageKeys {
  /**
   * First launch flag
   */
  FIRST_LAUNCH = 'first_launch',
  
  /**
   * App version
   */
  APP_VERSION = 'app_version',
  
  /**
   * Last update check
   */
  LAST_UPDATE_CHECK = 'last_update_check',
  
  /**
   * Debug mode flag
   */
  DEBUG_MODE = 'debug_mode',
}

/**
 * All storage keys combined
 */
export type StorageKey = 
  | AuthStorageKeys
  | PreferencesStorageKeys
  | ChatStorageKeys
  | AppStorageKeys;

// ============================================================================
// STORAGE SERVICE INTERFACES - Data persistence abstractions
// ============================================================================

/**
 * Interface for general storage operations
 * Provides methods for storing, retrieving, and removing data
 */
export interface IStorageService {
  /**
   * Store a string value with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store
   * @returns A Result indicating success or failure
   */
  setItem(key: StorageKey | string, value: string): Promise<Result<void>>;
  
  /**
   * Retrieve a string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getItem(key: StorageKey | string): Promise<Result<string | null>>;
  
  /**
   * Remove a stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  removeItem(key: StorageKey | string): Promise<Result<void>>;
  
  /**
   * Store an object value with the given key (serialized as JSON)
   * 
   * @param key The key to store the value under
   * @param value The object value to store
   * @returns A Result indicating success or failure
   */
  setObject<T>(key: StorageKey | string, value: T): Promise<Result<void>>;
  
  /**
   * Retrieve an object value for the given key (deserialized from JSON)
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getObject<T>(key: StorageKey | string): Promise<Result<T | null>>;
  
  /**
   * Check if a key exists in storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  hasKey(key: StorageKey | string): Promise<Result<boolean>>;
  
  /**
   * Clear all stored values
   * 
   * @returns A Result indicating success or failure
   */
  clear(): Promise<Result<void>>;

  /**
   * Clear storage by type
   * 
   * @param storageType The type of storage to clear
   * @returns A Result indicating success or failure
   */
  clear(storageType: 'local' | 'secure' | 'all'): Promise<Result<void>>;
}

/**
 * Interface for secure storage operations
 * Provides methods for storing, retrieving, and removing encrypted data
 */
export interface ISecureStorageService {
  /**
   * Store a string value securely with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store securely
   * @returns A Result indicating success or failure
   */
  setSecureItem(key: StorageKey | string, value: string): Promise<Result<void>>;
  
  /**
   * Retrieve a securely stored string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getSecureItem(key: StorageKey | string): Promise<Result<string | null>>;
  
  /**
   * Remove a securely stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  removeSecureItem(key: StorageKey | string): Promise<Result<void>>;
  
  /**
   * Store an object value securely with the given key (serialized as JSON)
   * 
   * @param key The key to store the value under
   * @param value The object value to store securely
   * @returns A Result indicating success or failure
   */
  setSecureObject<T>(key: StorageKey | string, value: T): Promise<Result<void>>;
  
  /**
   * Retrieve a securely stored object value for the given key (deserialized from JSON)
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getSecureObject<T>(key: StorageKey | string): Promise<Result<T | null>>;
  
  /**
   * Check if a key exists in secure storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  hasSecureKey(key: StorageKey | string): Promise<Result<boolean>>;
  
  /**
   * Check if secure storage is available on this platform
   * 
   * @returns A Result containing a boolean indicating if secure storage is available
   */
  isSecureStorageAvailable(): Promise<Result<boolean>>;
  
  /**
   * Delete all securely stored values
   * 
   * @returns A Result indicating success or failure
   */
  clearSecureStorage(): Promise<Result<void>>;
}

// ============================================================================
// STORAGE OPERATION RESULTS - Business operation results
// ============================================================================

/**
 * Storage operation result
 */
export interface StorageOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Batch storage operation result
 */
export interface BatchStorageResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: Array<{
    key: string;
    error: string;
  }>;
}

/**
 * Storage migration result
 */
export interface StorageMigrationResult {
  success: boolean;
  migratedKeys: string[];
  failedKeys: string[];
  errors: Array<{
    key: string;
    error: string;
  }>;
}

// ============================================================================
// STORAGE CONFIGURATION - Storage settings and options
// ============================================================================

/**
 * Storage configuration options
 */
export interface StorageConfig {
  /**
   * Whether to encrypt data by default
   */
  encryptByDefault?: boolean;
  
  /**
   * Maximum size for stored values (in bytes)
   */
  maxValueSize?: number;
  
  /**
   * Whether to compress large values
   */
  compressLargeValues?: boolean;
  
  /**
   * Compression threshold (in bytes)
   */
  compressionThreshold?: number;
  
  /**
   * Whether to enable storage quotas
   */
  enableQuotas?: boolean;
  
  /**
   * Storage quota per key type (in bytes)
   */
  quotas?: {
    [K in StorageKey]?: number;
  };
}

/**
 * Storage statistics
 */
export interface StorageStats {
  /**
   * Total number of stored items
   */
  itemCount: number;
  
  /**
   * Total storage size (in bytes)
   */
  totalSize: number;
  
  /**
   * Available storage space (in bytes)
   */
  availableSpace: number;
  
  /**
   * Storage usage by key type
   */
  usageByType: {
    [K in StorageKey]?: {
      count: number;
      size: number;
    };
  };
}

// ============================================================================
// STORAGE EVENTS - Storage change notifications
// ============================================================================

/**
 * Storage event types
 */
export enum StorageEvent {
  ITEM_SET = 'storage_item_set',
  ITEM_REMOVED = 'storage_item_removed',
  STORAGE_CLEARED = 'storage_cleared',
  QUOTA_EXCEEDED = 'storage_quota_exceeded',
  MIGRATION_COMPLETED = 'storage_migration_completed'
}

/**
 * Storage event data
 */
export interface StorageEventData {
  key?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  storageType: 'regular' | 'secure';
}

// ============================================================================
// STORAGE USECASE INTERFACES - UseCase-specific types
// ============================================================================

/**
 * Clear storage parameters
 */
export interface ClearStorageParams {
  storageType: 'local' | 'secure' | 'all';
}

/**
 * Clear storage result
 */
export interface ClearStorageResult {
  success: boolean;
  clearedKeys?: string[];
  error?: string;
}

/**
 * Get stored route parameters
 */
export interface GetStoredRouteParams {
  key: string;
}

/**
 * Get stored route result
 */
export interface GetStoredRouteResult {
  success: boolean;
  route?: string | null;
  error?: string;
}

/**
 * Set stored route parameters
 */
export interface SetStoredRouteParams {
  key: string;
  route: string;
}

/**
 * Set stored route result
 */
export interface SetStoredRouteResult {
  success: boolean;
  error?: string;
}

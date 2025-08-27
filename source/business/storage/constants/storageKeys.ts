/**
 * Storage keys used throughout the application
 * These keys are used for storing data in local storage, session storage, or secure storage
 */

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

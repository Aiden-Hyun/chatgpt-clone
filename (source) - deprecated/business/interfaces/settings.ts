/**
 * Settings Business Layer Interfaces
 * All settings-related interfaces, types, and data structures
 */


// ============================================================================
// SETTINGS DOMAIN TYPES
// ============================================================================

/**
 * Settings categories
 */
export enum SettingsCategory {
  ACCOUNT = 'account',
  PRIVACY = 'privacy',
  NOTIFICATIONS = 'notifications',
  APPEARANCE = 'appearance',
  DATA = 'data',
  ABOUT = 'about'
}

// ============================================================================
// SETTINGS STORAGE INTERFACES
// ============================================================================

/**
 * Settings storage keys
 */
export enum SettingsStorageKeys {
  USER_SETTINGS = 'user_settings',
  NOTIFICATION_SETTINGS = 'notification_settings',
  PRIVACY_SETTINGS = 'privacy_settings',
  APPEARANCE_SETTINGS = 'appearance_settings',
  DATA_SETTINGS = 'data_settings'
}

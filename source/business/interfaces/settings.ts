/**
 * Settings Business Layer Interfaces
 * All settings-related interfaces, types, and data structures
 */

import { IUserSession, Result } from './shared';

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

/**
 * Data export formats
 */
export type DataExportFormat = 'json' | 'csv' | 'txt';

/**
 * Data export scope
 */
export type DataExportScope = 'all' | 'messages' | 'profile' | 'settings';

// ============================================================================
// DATA PRIVACY INTERFACES
// ============================================================================

/**
 * Data export request parameters
 */
export interface DataExportRequest {
  format: DataExportFormat;
  scope: DataExportScope;
  includeMetadata?: boolean;
  session: IUserSession;
}

/**
 * Data export result
 */
export interface DataExportResult {
  data: string;
  format: DataExportFormat;
  scope: DataExportScope;
  exportedAt: Date;
  recordCount: number;
}

/**
 * Clear conversations request parameters
 */
export interface ClearConversationsDataRequest {
  roomIds?: string[];
  beforeDate?: Date;
  session: IUserSession;
}

/**
 * Clear conversations result
 */
export interface ClearConversationsDataResult {
  clearedRooms: number;
  clearedMessages: number;
  clearedAt: Date;
}

// ============================================================================
// APP INFO INTERFACES
// ============================================================================

/**
 * Application information
 */
export interface AppInfo {
  version: string;
  buildNumber: string;
  platform: string;
  environment: 'development' | 'staging' | 'production';
  lastUpdated: Date;
}

/**
 * Support information
 */
export interface SupportInfo {
  email: string;
  website: string;
  documentation: string;
  privacyPolicy: string;
  termsOfService: string;
  contactForm: string;
}

/**
 * Legal information
 */
export interface LegalInfo {
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  cookiePolicyUrl: string;
  dataProcessingUrl: string;
  lastUpdated: Date;
}

// ============================================================================
// SETTINGS SERVICE INTERFACES
// ============================================================================

/**
 * Interface for settings service operations
 * Provides methods for managing application settings and user preferences
 */
export interface ISettingsService {
  /**
   * Export user data
   */
  exportData(request: DataExportRequest): Promise<Result<DataExportResult>>;
  
  /**
 * Clear conversations
 */
clearConversations(request: ClearConversationsDataRequest): Promise<Result<ClearConversationsDataResult>>;
  
  /**
   * Get application information
   */
  getAppInfo(): Promise<Result<AppInfo>>;
  
  /**
   * Get support information
   */
  getSupportInfo(): Promise<Result<SupportInfo>>;
  
  /**
   * Get legal information
   */
  getLegalInfo(): Promise<Result<LegalInfo>>;
  
  /**
   * Get user settings
   */
  getUserSettings(session: IUserSession): Promise<Result<UserSettings>>;
  
  /**
   * Update user settings
   */
  updateUserSettings(session: IUserSession, settings: Partial<UserSettings>): Promise<Result<UserSettings>>;
}

// ============================================================================
// USER SETTINGS INTERFACES
// ============================================================================

/**
 * User settings data structure
 */
export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  data: DataSettings;
  lastUpdated: Date;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  enabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  systemNotifications: boolean;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  crashReporting: boolean;
  personalizedAds: boolean;
  shareUsageData: boolean;
}

/**
 * Appearance settings
 */
export interface AppearanceSettings {
  themeMode: 'light' | 'dark' | 'system';
  themeStyle: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

/**
 * Data settings
 */
export interface DataSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  dataRetention: number; // days
  exportFormat: DataExportFormat;
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

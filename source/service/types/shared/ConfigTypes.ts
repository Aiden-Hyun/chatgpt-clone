/**
 * Service Layer Configuration Types
 * 
 * Types related to application configuration in the service layer.
 */

/**
 * Application configuration structure
 */
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  edgeFunctionBaseUrl: string;
}

/**
 * Config service interface for dependency injection
 */
export interface IConfigService {
  getSupabaseUrl(): string;
  getSupabaseAnonKey(): string;
  getEdgeFunctionBaseUrl(): string;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  missingKeys: string[];
  errors: string[];
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enableBetaFeatures: boolean;
  enableDebugMode: boolean;
}

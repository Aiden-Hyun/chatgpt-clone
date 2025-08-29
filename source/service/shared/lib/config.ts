// source/service/shared/lib/config.ts
import Constants from 'expo-constants';

import { ILogger } from '../interfaces/ILogger';
import { Logger } from '../utils/Logger';

// Create a logger instance for config
const logger = new Logger().child('Config');

// Helper function to get a required value from the app config
function getRequiredConfig(key: string): string {
  const value = Constants.expoConfig?.extra?.[key];
  if (typeof value !== 'string' || value.length === 0) {
    const errorMessage = `Missing required app configuration for: ${key}. Make sure it's set in your .env file and app.config.js`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  if (__DEV__) {
    logger.debug(`Successfully loaded config: ${key}`);
  }
  return value;
}

// Centralized configuration for the client-side application
export const appConfig = {
  supabaseUrl: getRequiredConfig('supabaseUrl'),
  supabaseAnonKey: getRequiredConfig('supabaseAnonKey'),
  edgeFunctionBaseUrl: getRequiredConfig('edgeFunctionBaseUrl'),
};

// Config service interface for DI
export interface IConfigService {
  getSupabaseUrl(): string;
  getSupabaseAnonKey(): string;
  getEdgeFunctionBaseUrl(): string;
}

// Config service implementation
export class ConfigService implements IConfigService {
  constructor(private logger: ILogger = new Logger().child('ConfigService')) {}

  getSupabaseUrl(): string {
    return appConfig.supabaseUrl;
  }

  getSupabaseAnonKey(): string {
    return appConfig.supabaseAnonKey;
  }

  getEdgeFunctionBaseUrl(): string {
    return appConfig.edgeFunctionBaseUrl;
  }
}
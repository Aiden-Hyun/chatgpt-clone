// src/shared/lib/config.ts
import Constants from "expo-constants";
import { getLogger } from "../services/logger";

// Helper function to get a required value from the app config
function getRequiredConfig(key: string): string {
  const logger = getLogger("Config");
  const value = Constants.expoConfig?.extra?.[key];
  if (typeof value !== "string" || value.length === 0) {
    const errorMessage = `Missing required app configuration for: ${key}. Make sure it's set in your .env file and app.config.js`;
    logger.error(`Missing required app configuration for: ${key}`, {
      key,
      errorMessage,
    });
    throw new Error(errorMessage);
  }
  if (__DEV__) {
    logger.debug(`Successfully loaded config: ${key}`, { key });
  }
  return value;
}

// Centralized configuration for the client-side application
export const appConfig = {
  supabaseUrl: getRequiredConfig("supabaseUrl"),
  supabaseAnonKey: getRequiredConfig("supabaseAnonKey"),
  edgeFunctionBaseUrl: getRequiredConfig("edgeFunctionBaseUrl"),
};

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
    // Log sanitized values to verify runtime configuration on device/emulator
    const isSecret = key.toLowerCase().includes("key");
    const loggedValue = isSecret ? "[REDACTED]" : value;
    logger.debug(`Successfully loaded config: ${key}`, {
      key,
      value: loggedValue,
    });
  }
  return value;
}

// Centralized configuration for the client-side application
export const appConfig = {
  supabaseUrl: getRequiredConfig("supabaseUrl"),
  supabaseAnonKey: getRequiredConfig("supabaseAnonKey"),
  edgeFunctionBaseUrl: getRequiredConfig("edgeFunctionBaseUrl"),
};

if (__DEV__) {
  const logger = getLogger("Config");
  try {
    const supabaseUrl = new URL(appConfig.supabaseUrl);
    const edgeUrl = new URL(appConfig.edgeFunctionBaseUrl);
    logger.info("Resolved endpoints for runtime", {
      supabase: {
        protocol: supabaseUrl.protocol,
        host: supabaseUrl.host,
        href: appConfig.supabaseUrl,
      },
      edge: {
        protocol: edgeUrl.protocol,
        host: edgeUrl.host,
        href: appConfig.edgeFunctionBaseUrl,
      },
    });
  } catch (_err) {
    logger.warn("Failed to parse one or more endpoint URLs", {
      supabaseUrl: appConfig.supabaseUrl,
      edgeFunctionBaseUrl: appConfig.edgeFunctionBaseUrl,
    });
  }
}

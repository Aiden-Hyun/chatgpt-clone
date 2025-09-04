/**
 * Centralized storage key constants
 * All storage keys used across the application should be defined here
 * to prevent conflicts and ensure consistency.
 */

export const STORAGE_KEYS = {
  // Theme-related keys
  THEME_MODE: "@theme_mode",
  THEME_STYLE: "@theme_style",
  
  // Auth-related keys (if any are needed beyond Supabase's own)
  // Add more as needed
  
  // Chat-related keys (if any are needed)
  // Add more as needed
  
  // User preferences
  // Add more as needed
} as const;

/**
 * Storage key validation
 * Ensures storage keys follow the expected format
 */
export const validateStorageKey = (key: string): boolean => {
  // Storage keys should start with @ and contain only alphanumeric characters, underscores, and hyphens
  return /^@[a-zA-Z0-9_-]+$/.test(key);
};

/**
 * Get all storage keys for debugging/cleanup purposes
 */
export const getAllStorageKeys = (): string[] => {
  return Object.values(STORAGE_KEYS);
};

// src/lib/constants.ts
// This file contains constants that can be used throughout the application

// OpenAI configuration
export const OPENAI = {
  MODEL: 'gpt-3.5-turbo',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1000,
};

// App configuration
export const APP = {
  NAME: 'ChatGPT Clone',
  VERSION: '1.0.0',
};

// NOTE: All secrets and keys have been moved to a secure configuration file.
// This file is for non-sensitive, app-wide constants only.

// Network configuration
export const NETWORK = {
  // Default request timeout for API calls (in milliseconds)
  REQUEST_TIMEOUT_MS: 120000,
};

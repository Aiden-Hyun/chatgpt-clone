// Application constants - pure configuration values

// OpenAI configuration
export const OPENAI = {
  MODEL: 'gpt-3.5-turbo',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1000,
} as const;

// App configuration
export const APP = {
  NAME: 'ChatGPT Clone',
  VERSION: '1.0.0',
} as const;

// Network configuration
export const NETWORK = {
  // Default request timeout for API calls (in milliseconds)
  REQUEST_TIMEOUT_MS: 120000,
} as const;

// Validation constants
export const VALIDATION = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_TITLE_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6,
  MAX_RETRIES: 3,
} as const;

// Animation constants
export const ANIMATION = {
  TYPING_DELAY_MS: 50,
  MESSAGE_FADE_DURATION_MS: 300,
  LOADING_TIMEOUT_MS: 30000,
} as const;

// Model constants
export const MODELS = {
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_4: 'gpt-4',
  CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
} as const;

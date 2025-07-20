// src/features/chat/constants/index.ts

// Default model to use for chat completions
export const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Available models for chat
export const AVAILABLE_MODELS = [
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-4', value: 'gpt-4' },
];

// Maximum number of messages to keep in chat history
export const MAX_MESSAGES = 100;

// Typing animation speed in milliseconds
export const TYPING_ANIMATION_SPEED = 10;

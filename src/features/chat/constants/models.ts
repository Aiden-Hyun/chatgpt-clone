// src/features/chat/constants/models.ts

export type ModelProvider = 'openai' | 'anthropic';

// Available models for chat
export const AVAILABLE_MODELS = [
  // OpenAI Models
  { label: 'GPT-5', value: 'gpt-5', provider: 'openai' as ModelProvider },
  { label: 'GPT-5 Mini', value: 'gpt-5-mini', provider: 'openai' as ModelProvider },
  { label: 'GPT-5 Nano', value: 'gpt-5-nano', provider: 'openai' as ModelProvider },
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'openai' as ModelProvider },
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini', provider: 'openai' as ModelProvider },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo', provider: 'openai' as ModelProvider },
  { label: 'GPT-4', value: 'gpt-4', provider: 'openai' as ModelProvider },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', provider: 'openai' as ModelProvider },
  { label: 'GPT Image 1', value: 'gpt-image-1', provider: 'openai' as ModelProvider },
  { label: 'DALL·E 3', value: 'dall-e-3', provider: 'openai' as ModelProvider },

  // Anthropic Models
  { label: 'Claude Opus 4.1', value: 'claude-opus-4-1-20250805', provider: 'anthropic' as ModelProvider },
  { label: 'Claude Opus 4', value: 'claude-opus-4-20250514', provider: 'anthropic' as ModelProvider },
  { label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514', provider: 'anthropic' as ModelProvider },
  { label: 'Claude Sonnet 3.7', value: 'claude-3-7-sonnet-20250219', provider: 'anthropic' as ModelProvider },
  { label: 'Claude Haiku 3.5', value: 'claude-3-5-haiku-20241022', provider: 'anthropic' as ModelProvider },
  { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229', provider: 'anthropic' as ModelProvider },
  { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229', provider: 'anthropic' as ModelProvider },
  { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307', provider: 'anthropic' as ModelProvider },
] as const;

export type ModelValue = typeof AVAILABLE_MODELS[number]['value'];

// Default model to use for chat completions
export const DEFAULT_MODEL: ModelValue = 'gpt-3.5-turbo';



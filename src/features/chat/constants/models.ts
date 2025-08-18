// src/features/chat/constants/models.ts

export type ModelProvider = 'openai' | 'anthropic';

// Model capabilities
export type ModelCapability = 'chat' | 'image' | 'search' | 'vision' | 'code' | 'analysis';

export interface ModelCapabilities {
  chat: boolean;
  image: boolean;
  search: boolean;
  vision: boolean;
  code: boolean;
  analysis: boolean;
}

export interface ModelInfo {
  label: string;
  value: string;
  provider: ModelProvider;
  capabilities: ModelCapabilities;
  description?: string;
  tokenParameter?: 'max_tokens' | 'max_completion_tokens'; // New field for token parameter
  supportsCustomTemperature?: boolean; // New field for temperature support
  defaultTemperature?: number; // Default temperature for models that don't support custom values
}

// Helper function to determine the correct token parameter for a model
export const getTokenParameter = (model: string): 'max_tokens' | 'max_completion_tokens' => {
  // GPT-5 models use max_completion_tokens
  if (model.startsWith('gpt-5')) {
    return 'max_completion_tokens';
  }
  // Claude 3.5 models use max_completion_tokens
  if (model.startsWith('claude-3-5')) {
    return 'max_completion_tokens';
  }
  // All other models (including Claude Opus 4.x) use max_tokens
  return 'max_tokens';
};

// Helper function to determine if a model supports custom temperature
export const supportsCustomTemperature = (model: string): boolean => {
  // GPT-5 models don't support custom temperature
  if (model.startsWith('gpt-5')) {
    return false;
  }
  // Most other models support custom temperature
  return true;
};

// Available models for chat with capabilities
export const AVAILABLE_MODELS: ModelInfo[] = [
  // OpenAI Models
  { 
    label: 'GPT-5', 
    value: 'gpt-5', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: true,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Most capable model for complex reasoning',
    tokenParameter: 'max_completion_tokens',
    supportsCustomTemperature: false,
    defaultTemperature: 1
  },
  { 
    label: 'GPT-5 Mini', 
    value: 'gpt-5-mini', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: true,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Fast and efficient for most tasks',
    tokenParameter: 'max_completion_tokens',
    supportsCustomTemperature: false,
    defaultTemperature: 1
  },
  { 
    label: 'GPT-5 Nano', 
    value: 'gpt-5-nano', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: false,
      code: true,
      analysis: false
    },
    description: 'Lightning fast for simple tasks',
    tokenParameter: 'max_completion_tokens',
    supportsCustomTemperature: false,
    defaultTemperature: 1
  },
  { 
    label: 'GPT-4o', 
    value: 'gpt-4o', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: true,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Balanced performance and speed',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'GPT-4o Mini', 
    value: 'gpt-4o-mini', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: false
    },
    description: 'Fast and cost-effective',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'GPT-4 Turbo', 
    value: 'gpt-4-turbo', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Advanced reasoning capabilities',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'GPT-4', 
    value: 'gpt-4', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Reliable and well-tested',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'GPT-3.5 Turbo', 
    value: 'gpt-3.5-turbo', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: false,
      code: true,
      analysis: false
    },
    description: 'Fast and reliable for everyday use',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'GPT Image 1', 
    value: 'gpt-image-1', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: false,
      image: true,
      search: false,
      vision: false,
      code: false,
      analysis: false
    },
    description: 'Specialized for image generation',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'DALL·E 3', 
    value: 'dall-e-3', 
    provider: 'openai' as ModelProvider,
    capabilities: {
      chat: false,
      image: true,
      search: false,
      vision: false,
      code: false,
      analysis: false
    },
    description: 'High-quality image generation',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },

  // Anthropic Models
  { 
    label: 'Claude Opus 4.1', 
    value: 'claude-opus-4-1-20250805', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: true,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Most capable Claude model',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'Claude Opus 4', 
    value: 'claude-opus-4-20250514', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Advanced reasoning and analysis',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'Claude Sonnet 4', 
    value: 'claude-sonnet-4-20250514', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Balanced performance and capabilities',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'Claude Sonnet 3.7', 
    value: 'claude-3-7-sonnet-20250219', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Reliable and well-rounded',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'Claude Haiku 3.5', 
    value: 'claude-3-5-haiku-20241022', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: false
    },
    description: 'Fast and efficient',
    tokenParameter: 'max_completion_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'Claude 3 Opus', 
    value: 'claude-3-opus-20240229', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Powerful reasoning capabilities',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'Claude 3 Sonnet', 
    value: 'claude-3-sonnet-20240229', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Balanced performance',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
  { 
    label: 'Claude 3 Haiku', 
    value: 'claude-3-haiku-20240307', 
    provider: 'anthropic' as ModelProvider,
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: false
    },
    description: 'Fast and lightweight',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true
  },
] as const;

export type ModelValue = typeof AVAILABLE_MODELS[number]['value'];

// Default model to use for chat completions
export const DEFAULT_MODEL: ModelValue = 'gpt-3.5-turbo';

// Helper function to get model info by value
export const getModelInfo = (value: string): ModelInfo | undefined => {
  return AVAILABLE_MODELS.find(model => model.value === value);
};





// Model provider types
export type ModelProvider = 'openai' | 'anthropic' | 'perplexity';

// Model capabilities interface
export interface ModelCapabilities {
  chat: boolean;
  image: boolean;
  search: boolean;
  vision: boolean;
  code: boolean;
  analysis: boolean;
}

// Model information interface
export interface ModelInfo {
  label: string;
  value: string;
  provider: ModelProvider;
  capabilities: ModelCapabilities;
  description?: string;
  tokenParameter?: 'max_tokens' | 'max_completion_tokens';
  supportsCustomTemperature?: boolean;
  defaultTemperature?: number;
}

// Available models for chat with capabilities
export const AVAILABLE_MODELS: ModelInfo[] = [
  { 
    label: 'GPT-4', 
    value: 'gpt-4', 
    provider: 'openai',
    capabilities: {
      chat: true,
      image: false,
      search: false,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Most capable GPT-4 model for complex tasks requiring deep understanding and analysis.',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true,
    defaultTemperature: 0.7
  },
  { 
    label: 'GPT-3.5 Turbo', 
    value: 'gpt-3.5-turbo', 
    provider: 'openai',
    capabilities: {
      chat: true,
      image: false,
      search: true,
      vision: false,
      code: true,
      analysis: true
    },
    description: 'Fast and efficient for most chat and coding tasks.',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true,
    defaultTemperature: 0.7
  },
  { 
    label: 'Claude 3 Opus', 
    value: 'claude-3-opus', 
    provider: 'anthropic',
    capabilities: {
      chat: true,
      image: true,
      search: true,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Most capable Claude model with superior reasoning and analysis.',
    tokenParameter: 'max_completion_tokens',
    supportsCustomTemperature: false,
    defaultTemperature: 1
  },
  { 
    label: 'Claude 3 Sonnet', 
    value: 'claude-3-sonnet', 
    provider: 'anthropic',
    capabilities: {
      chat: true,
      image: true,
      search: true,
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Balanced performance and speed for most tasks.',
    tokenParameter: 'max_completion_tokens',
    supportsCustomTemperature: false,
    defaultTemperature: 1
  },
  { 
    label: 'Claude 3 Haiku', 
    value: 'claude-3-haiku', 
    provider: 'anthropic',
    capabilities: {
      chat: true,
      image: true,
      search: true,
      vision: true,
      code: true,
      analysis: false
    },
    description: 'Fast responses for simpler tasks and chat.',
    tokenParameter: 'max_completion_tokens',
    supportsCustomTemperature: false,
    defaultTemperature: 1
  },
  { 
    label: 'Perplexity Online', 
    value: 'pplx-online', 
    provider: 'perplexity',
    capabilities: {
      chat: true,
      image: false,
      search: true,
      vision: false,
      code: true,
      analysis: true
    },
    description: 'Real-time information and search capabilities.',
    tokenParameter: 'max_tokens',
    supportsCustomTemperature: true,
    defaultTemperature: 0.7
  }
] as const;

// Type for model values
export type ModelValue = typeof AVAILABLE_MODELS[number]['value'];

// Default model to use for chat completions
export const DEFAULT_MODEL: ModelValue = 'gpt-3.5-turbo';

// Helper function to get model info by value
export const getModelInfo = (value: string): ModelInfo | undefined => {
  return AVAILABLE_MODELS.find(model => model.value === value);
};

// Helper function to validate model capabilities
export const validateModelCapabilities = (model: string, requiredCapabilities: Partial<ModelCapabilities>): boolean => {
  const modelInfo = getModelInfo(model);
  if (!modelInfo) return false;

  return Object.entries(requiredCapabilities).every(([capability, required]) => {
    if (!required) return true;
    return modelInfo.capabilities[capability as keyof ModelCapabilities];
  });
};

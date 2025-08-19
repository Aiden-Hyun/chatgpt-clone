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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Most advanced AI model with superior reasoning, analysis, and creative capabilities. Best for complex problem-solving and high-stakes tasks.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'High-performance model with excellent reasoning and analysis. Great balance of capability and speed for demanding tasks.',
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
    description: 'Lightning-fast model perfect for quick responses, simple tasks, and everyday conversations.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Versatile model with strong reasoning, coding, and analysis skills. Excellent for professional work and creative projects.',
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
      search: true, // Enabled for cheaper model
      vision: true,
      code: true,
      analysis: false
    },
    description: 'Fast model with vision capabilities. Great for image analysis, coding, and general tasks with search enabled.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Advanced reasoning and analysis capabilities. Ideal for complex problem-solving, research, and detailed analysis.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Reliable and well-tested model with strong reasoning abilities. Perfect for professional work and detailed analysis.',
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
      search: true, // Enabled for cheaper model
      vision: false,
      code: true,
      analysis: false
    },
    description: 'Fast and reliable model excellent for everyday conversations, quick coding, and general tasks with search capability.',
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
    description: 'Specialized for high-quality image generation. Creates detailed, creative images from text descriptions.',
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
    description: 'Advanced image generation with exceptional detail and artistic quality. Perfect for creative projects and visual content.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Most capable Claude model with superior reasoning and analysis. Best for complex research, coding, and creative writing.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Advanced reasoning and analysis capabilities. Excellent for research, complex problem-solving, and detailed analysis.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Balanced performance with strong reasoning and coding abilities. Great for professional work and creative projects.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Reliable and well-rounded model with good reasoning and coding skills. Perfect for everyday professional tasks.',
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
      search: true, // Enabled for cheaper model
      vision: true,
      code: true,
      analysis: false
    },
    description: 'Fast and efficient with vision capabilities. Great for quick responses, image analysis, and coding with search enabled.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Powerful reasoning and analysis capabilities. Ideal for complex research, coding, and creative writing projects.',
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
      search: false, // Disabled for expensive model
      vision: true,
      code: true,
      analysis: true
    },
    description: 'Balanced performance with strong reasoning abilities. Great for professional work and creative projects.',
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
      search: true, // Enabled for cheaper model
      vision: true,
      code: true,
      analysis: false
    },
    description: 'Fast and lightweight with vision capabilities. Perfect for quick responses, image analysis, and everyday tasks with search.',
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





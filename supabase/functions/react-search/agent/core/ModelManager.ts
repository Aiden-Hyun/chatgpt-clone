import OpenAI from "jsr:@openai/openai";
import { config as appConfig } from "../../../shared/config.ts";
import { AnthropicProvider } from "../providers/AnthropicProvider.ts";
import { OpenAIProvider } from "../providers/OpenAIProvider.ts";
import { AIProviderManager } from "../services/AIProviderManager.ts";
import type { ProviderName } from "../types/AIProvider.ts";
import type { ReActAgentConfig } from "../types/AgentTypes.ts";

type ModelProvider = 'openai' | 'anthropic';

// Default AI models for reasoning and synthesis
const DEFAULT_REASONING_MODEL = Deno.env.get("OPENAI_REASONING_MODEL") ?? "gpt-4o-mini";
const DEFAULT_SYNTH_MODEL = Deno.env.get("OPENAI_SYNTH_MODEL") ?? "gpt-4o";

export interface ModelInfo {
  reasoningModel: string;
  synthesisModel: string;
  reasoningModelProvider: ModelProvider;
  synthesisModelProvider: ModelProvider;
  openai: OpenAI | null;
  aiProviderManager: AIProviderManager; // NEW: AI Provider Manager
}



/**
 * Determines which AI provider to use based on model name
 * 
 * @param model - The model name (e.g., "gpt-4o", "claude-3-sonnet")
 * @returns The provider type ('openai' or 'anthropic')
 */
function getModelProvider(model: string): ModelProvider {
  if (model.startsWith('claude')) {
    return 'anthropic';
  }
  return 'openai';
}

/**
 * ModelManager - Handles all model configuration and provider logic
 * 
 * This class manages:
 * - AI model selection (reasoning vs synthesis models)
 * - Provider detection (OpenAI vs Anthropic)
 * - Model configuration (temperature, tokens, etc.)
 * - OpenAI client initialization
 * - AI Provider Manager integration
 */
export class ModelManager {
  private reasoningModel: string;
  private synthesisModel: string;
  private reasoningModelProvider: ModelProvider;
  private synthesisModelProvider: ModelProvider;
  private openai: OpenAI | null = null;
  private aiProviderManager: AIProviderManager;
  private cfg: ReActAgentConfig;

  constructor(cfg: ReActAgentConfig) {
    this.cfg = cfg;
    
    // Configure AI models - use single model for both if specified, otherwise use defaults
    if (cfg.model) {
      this.reasoningModel = cfg.model;
      this.synthesisModel = cfg.model;
    } else {
      this.reasoningModel = cfg.reasoningModel ?? DEFAULT_REASONING_MODEL;
      this.synthesisModel = cfg.synthesisModel ?? DEFAULT_SYNTH_MODEL;
    }
    
    // Determine which AI providers to use based on model names
    this.reasoningModelProvider = cfg.reasoningModelProvider ?? getModelProvider(this.reasoningModel);
    this.synthesisModelProvider = cfg.synthesisModelProvider ?? getModelProvider(this.synthesisModel);
    
    console.log(`[ModelManager] Debug: reasoningModelProvider=${this.reasoningModelProvider}, synthesisModelProvider=${this.synthesisModelProvider}`);
    console.log(`[ModelManager] Debug: Will initialize OpenAI client: ${this.reasoningModelProvider === 'openai' || this.synthesisModelProvider === 'openai'}`);
    
    // Initialize AI Provider Manager
    this.aiProviderManager = new AIProviderManager(cfg.debug);
    
    // Initialize OpenAI client only if needed
    if (this.reasoningModelProvider === 'openai' || this.synthesisModelProvider === 'openai') {
      try {
        const apiKey = appConfig.secrets.openai.apiKey();
        console.log(`[ModelManager] Debug: OpenAI API key length: ${apiKey ? apiKey.length : 0}`);
        this.openai = new OpenAI({ apiKey });
        console.log(`[ModelManager] Debug: OpenAI client initialized successfully`);
        
        // Register OpenAI provider
        const openaiProvider = new OpenAIProvider(this.openai);
        this.aiProviderManager.registerProvider(openaiProvider);
        console.log(`[ModelManager] Debug: OpenAI provider registered`);
      } catch (error) {
        console.error(`[ModelManager] Error initializing OpenAI client:`, error);
        throw error;
      }
    }
    
    // Register Anthropic provider (always available)
    const anthropicProvider = new AnthropicProvider();
    this.aiProviderManager.registerProvider(anthropicProvider);
    console.log(`[ModelManager] Debug: Anthropic provider registered`);
    
    console.log(`[ModelManager] Init: reasoning=${this.reasoningModel} (${this.reasoningModelProvider}), synthesis=${this.synthesisModel} (${this.synthesisModelProvider})`);
    console.log(`[ModelManager] Init: Registered providers: ${this.aiProviderManager.getRegisteredProviders().join(', ')}`);
  }

  /**
   * Gets standardized model configuration for OpenAI/Anthropic calls
   * 
   * @param isReasoning - Whether this is for reasoning (true) or synthesis (false)
   * @returns Model configuration object with temperature, tokens, etc.
   */
  getModelConfig(isReasoning: boolean): any {
    const provider = isReasoning ? this.reasoningModelProvider : this.synthesisModelProvider;
    
    // Use the passed modelConfig if available, otherwise fall back to defaults
    if (this.cfg.modelConfig) {
      return {
        tokenParameter: this.cfg.modelConfig.tokenParameter || 'max_tokens',
        supportsCustomTemperature: this.cfg.modelConfig.supportsCustomTemperature ?? true,
        defaultTemperature: this.cfg.modelConfig.defaultTemperature || (provider === 'anthropic' ? 0.7 : 0.1),
        max_tokens: isReasoning ? 200 : 4000
      };
    }
    
    // Fallback to provider-specific defaults
    if (provider === 'anthropic') {
      return {
        tokenParameter: 'max_tokens',
        supportsCustomTemperature: true,
        defaultTemperature: 0.7,
        max_tokens: isReasoning ? 200 : 4000
      };
    } else {
      return {
        tokenParameter: 'max_tokens',
        supportsCustomTemperature: true,
        defaultTemperature: 0.1,
        max_tokens: isReasoning ? 200 : 4000
      };
    }
  }
  

  /**
   * Get model information including providers and AI Provider Manager
   * 
   * @returns Model information object
   */
  getModelInfo(): ModelInfo {
    return {
      reasoningModel: this.reasoningModel,
      synthesisModel: this.synthesisModel,
      reasoningModelProvider: this.reasoningModelProvider,
      synthesisModelProvider: this.synthesisModelProvider,
      openai: this.openai,
      aiProviderManager: this.aiProviderManager
    };
  }

  /**
   * Make an AI call using the appropriate provider
   * 
   * @param providerName - The provider to use ('openai' or 'anthropic')
   * @param model - The model to use
   * @param messages - Array of messages
   * @param config - Configuration options
   * @returns Promise resolving to the AI response
   */
  async makeAICall(providerName: ProviderName, model: string, messages: any[], config: any) {
    return this.aiProviderManager.call(providerName, model, messages, config);
  }

  /**
   * Get the AI Provider Manager instance
   * 
   * @returns The AI Provider Manager
   */
  getAIProviderManager(): AIProviderManager {
    return this.aiProviderManager;
  }
}

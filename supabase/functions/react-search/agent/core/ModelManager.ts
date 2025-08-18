import OpenAI from "jsr:@openai/openai";
import { config as appConfig } from "../../../shared/config.ts";

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
}

export interface ReActAgentConfig {
  model?: string;
  reasoningModel?: string;
  synthesisModel?: string;
  reasoningModelProvider?: ModelProvider;
  synthesisModelProvider?: ModelProvider;
  modelConfig?: any;
  debug?: boolean;
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
 */
export class ModelManager {
  private reasoningModel: string;
  private synthesisModel: string;
  private reasoningModelProvider: ModelProvider;
  private synthesisModelProvider: ModelProvider;
  private openai: OpenAI | null = null;
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
    
    // Initialize OpenAI client only if needed
    if (this.reasoningModelProvider === 'openai' || this.synthesisModelProvider === 'openai') {
      try {
        const apiKey = appConfig.secrets.openai.apiKey();
        console.log(`[ModelManager] Debug: OpenAI API key length: ${apiKey ? apiKey.length : 0}`);
        this.openai = new OpenAI({ apiKey });
        console.log(`[ModelManager] Debug: OpenAI client initialized successfully`);
      } catch (error) {
        console.error(`[ModelManager] Error initializing OpenAI client:`, error);
        throw error;
      }
    }
    
    console.log(`[ModelManager] Init: reasoning=${this.reasoningModel} (${this.reasoningModelProvider}), synthesis=${this.synthesisModel} (${this.synthesisModelProvider})`);
  }

  /**
   * Gets standardized model configuration for OpenAI/Anthropic calls
   * 
   * @param isReasoning - Whether this is for reasoning (true) or synthesis (false)
   * @returns Model configuration object with temperature, tokens, etc.
   */
  getModelConfig(isReasoning: boolean): any {
    const baseConfig = this.cfg.modelConfig || {};
    const defaultTemp = isReasoning ? 0.1 : 0.2;
    const defaultTokens = isReasoning ? 300 : 1200;
    
    return {
      tokenParameter: baseConfig.tokenParameter || 'max_tokens',
      supportsCustomTemperature: baseConfig.supportsCustomTemperature !== false,
      defaultTemperature: baseConfig.defaultTemperature || defaultTemp,
      max_tokens: baseConfig.max_tokens || defaultTokens
    };
  }

  /**
   * Get OpenAI client instance
   * 
   * @returns OpenAI client or null if not needed
   */
  getOpenAIClient(): OpenAI | null {
    return this.openai;
  }

  /**
   * Get all model information
   * 
   * @returns Complete model configuration including providers and client
   */
  getModelInfo(): ModelInfo {
    return {
      reasoningModel: this.reasoningModel,
      synthesisModel: this.synthesisModel,
      reasoningModelProvider: this.reasoningModelProvider,
      synthesisModelProvider: this.synthesisModelProvider,
      openai: this.openai,
    };
  }

  /**
   * Get reasoning model info
   * 
   * @returns Reasoning model name and provider
   */
  getReasoningModel(): { model: string; provider: ModelProvider } {
    return {
      model: this.reasoningModel,
      provider: this.reasoningModelProvider,
    };
  }

  /**
   * Get synthesis model info
   * 
   * @returns Synthesis model name and provider
   */
  getSynthesisModel(): { model: string; provider: ModelProvider } {
    return {
      model: this.synthesisModel,
      provider: this.synthesisModelProvider,
    };
  }
}

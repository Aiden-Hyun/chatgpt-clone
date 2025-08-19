/**
 * AI Provider Interface and Types
 * 
 * This file defines the interface for AI providers and related types
 * to enable a clean, centralized approach to managing different AI services.
 */

export interface AIProviderResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface AIProvider {
  /**
   * Make a call to the AI provider
   * 
   * @param model - The model to use
   * @param messages - Array of messages (system, user, assistant)
   * @param config - Configuration options (temperature, tokens, etc.)
   * @returns Promise resolving to the AI response
   */
  call(model: string, messages: any[], config: any): Promise<AIProviderResponse>;
  
  /**
   * Get the name of this provider
   * 
   * @returns Provider name (e.g., 'openai', 'anthropic')
   */
  getName(): string;
}

export interface AIProviderConfig {
  temperature?: number;
  maxTokens?: number;
  tokenParameter?: string;
  defaultTemperature?: number;
  max_tokens?: number;
  [key: string]: any; // Allow additional config options
}

export type ProviderName = 'openai' | 'anthropic';
